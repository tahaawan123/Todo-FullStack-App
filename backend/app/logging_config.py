import logging
import sys
from datetime import datetime

def setup_logging():
    """
    Set up logging configuration for the application.
    """
    # Create logger
    logger = logging.getLogger("todo_api")
    logger.setLevel(logging.INFO)

    # Create console handler and set level
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)

    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)

    # Add handler to logger
    if not logger.handlers:
        logger.addHandler(console_handler)

    return logger

# Global logger instance
logger = setup_logging()