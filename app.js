const Groq = require("groq-sdk");
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const CancerData = require("./models/upload.js");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const https = require("https");
const API_KEY = process.env.PDF_API_KEY;
const predict = require("./testModel.js");

const cloudinary = require("cloudinary").v2;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const bodyParser = require("body-parser");
const MongoStore = require("connect-mongo");
const LocalStrategy = require("passport-local");
const passport = require("passport");
const flash = require("connect-flash");

const multer = require("multer");
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });
const dbUrl = process.env.ATLASDB_URL;

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60,
});

store.on("error", (error) => {
  console.log("Error in MONGO SESSION STORE: ", error);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("Connection Succeeded");
  })
  .catch((err) => console.log(err));

app.use(session(sessionOptions));
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use("public/media/", express.static("./public/media"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.json());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

let port = 3000;

app.listen(port, (req, res) => {
  console.log("Listening to the Port: http://localhost:3000/scan");
});

app.get("/scan", (req, res) => {
  res.render("index.ejs");
});

async function reportAnalysis(report) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Predicts the type of cancer based on the provided data. The report includes ${report}; however, for an accurate diagnosis and further evaluation, consultation with a medical professional is essential. Summarize the report in three key bullet points.`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

app.post("/scan", upload.single("file"), async (req, res) => {
  try {
    const { userName, fileType, scanType, textInput } = req.body;
    let filePath;
    let cancerClass;
    let resultPdf;
    let resultImg;
    let extractedTextImg;

    if (fileType === "pdf") {
      filePath = req.file.path;
      try {
        let imageUrls = await convertPDFToImageFromURL(filePath);
        if (imageUrls && imageUrls.length > 0) {
          let extractedText = await imageToText(imageUrls[0]);
          resultPdf = await reportAnalysis(extractedText);
        } else {
          throw new Error("No image URLs returned from PDF conversion");
        }
      } catch (e) {
        console.error("Error processing PDF:", e);
        throw new Error(`Failed to process PDF: ${e.message}`);
      }
    } else if (fileType === "image") {
      filePath = req.file.path;
      // try {
      //   extractedTextImg = await imageToText(filePath);
      //   resultImg = await reportAnalysis(extractedTextImg);

      // } catch (e) {
      //   console.error("Error processing image:", e);
      //   throw new Error(`Failed to process image: ${e.message}`);
      // }
      try {
        // Await the predict function
        resultImg = await predict(filePath);
        // console.log("Prediction:", resultImg);
      } catch (e) {
        console.error("Error processing image:", e);
        throw new Error(`Failed to process image: ${e.message}`);
      }
    } else if (fileType === "text") {
      try {
        let result = await reportAnalysis(textInput);
        cancerClass = [result];
      } catch (e) {
        console.error("Error processing text input:", e);
        throw new Error(`Failed to process text input: ${e.message}`);
      }
    } else {
      throw new Error("Invalid file type");
    }

    if (fileType === "image") {
      cancerClass = [resultImg];
    } else if (fileType === "pdf") {
      cancerClass = [resultPdf];
    }

    // Save the form data to the database
    const formData = new CancerData({
      userName,
      fileType,
      scanType,
      filePath,
      textInput,
      cancerClass,
    });
    await formData.save();

    req.flash("success", "Data Uploaded Successfully!");
    // Send cancer class and filePath to frontend
    res.status(200).json({
      success: true,
      cancerClass,
      filePath: fileType !== "text" ? filePath : null, // Only send filePath for non-text uploads
    });
  } catch (error) {
    console.error("Error in /scan route:", error);
    req.flash(
      "error",
      error.message || "Failed to submit form or predict cancer class"
    );
    res.status(500).json({
      success: false,
      error: error.message || "Failed to submit form or predict cancer class",
    });
  }
});

function convertPDFToImageFromURL(
  pdfUrl,
  pages = "",
  password = "",
  imageType = "jpg"
) {
  return new Promise((resolve, reject) => {
    // Prepare URL for PDF to Image API call
    const queryPath = `/v1/pdf/convert/to/${imageType}`;

    // JSON payload for API request
    const jsonPayload = JSON.stringify({
      password: password,
      pages: pages,
      url: pdfUrl,
    });

    const reqOptions = {
      host: "api.pdf.co",
      method: "POST",
      path: queryPath,
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(jsonPayload, "utf8"),
      },
    };

    // Send request
    const postRequest = https.request(reqOptions, (response) => {
      let chunks = [];

      response.on("data", (chunk) => {
        chunks.push(chunk);
      });

      response.on("end", () => {
        const data = JSON.parse(Buffer.concat(chunks).toString());
        if (data.error === false) {
          // Resolve with the URLs of the generated image files
          resolve(data.urls);
        } else {
          // Reject with the error message from the API
          reject(`Error: ${data.message}`);
        }
      });
    });

    postRequest.on("error", (e) => {
      // Handle request error
      reject(`Request error: ${e.message}`);
    });

    // Write request data
    postRequest.write(jsonPayload);
    postRequest.end();
  });
}

async function imageToText(iurl) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content:
            "Extract the text only from the following image. Don't give any description about the image.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: iurl,
              },
            },
          ],
        },
      ],
      model: "llama-3.2-11b-vision-preview",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null,
    });
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error("Error in imageToText:", error);
    throw error;
  }
}

app.get("*", (req, res) => {
  res.redirect("/scan");
});
