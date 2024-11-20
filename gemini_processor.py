# gemini_processor.py
import os
import sys
import logging
from typing import Optional
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def setup_gemini() -> Optional[genai.GenerativeModel]:
    """Setup Gemini with API key from .env file."""
    try:
        load_dotenv()
        api_key = os.getenv('GOOGLE_API_KEY')
        
        if not api_key:
            logger.error("No API key found in .env file")
            return None
            
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-1.5-pro')
        
    except Exception as e:
        logger.error(f"Failed to setup Gemini: {str(e)}")
        return None

def process_image(
    image_path: str,
    model: genai.GenerativeModel,
    prompt: str = "Extract the text in the image verbatim"
) -> Optional[str]:
    """Process image and extract text using Gemini model."""
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary (handles PNG with transparency)
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                bg = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                bg.paste(img, mask=img.split()[-1])
                img = bg
            
            try:
                response = model.generate_content([prompt, img])
                response.resolve()
                
                if response.text:
                    return response.text.strip()
                else:
                    logger.error("No text was extracted from the image")
                    return None
                    
            except genai.types.generation_types.BlockedPromptException as e:
                logger.error(f"Content generation was blocked: {str(e)}")
                return None
            except Exception as e:
                logger.error(f"Error generating content: {str(e)}")
                return None
            
    except Image.UnidentifiedImageError:
        logger.error("Could not identify image file format")
        return None
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return None

def main(image_path: str) -> int:
    """Main function to process an image using Gemini."""
    # Initialize Gemini
    model = setup_gemini()
    if not model:
        return 1

    # Check if image exists
    if not os.path.exists(image_path):
        logger.error(f"Image file not found: {image_path}")
        return 1

    # Process image
    result = process_image(image_path, model)
    if result:
        print("\nExtracted Text:")
        print(result)
        return 0
    else:
        logger.error("Failed to extract text")
        return 1

if __name__ == "__main__":
    try:
        if len(sys.argv) != 2:
            logger.error("Please provide an image path")
            sys.exit(1)
            
        sys.exit(main(sys.argv[1]))
        
    except KeyboardInterrupt:
        logger.info("Process interrupted by user")
        sys.exit(0)
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        sys.exit(1)