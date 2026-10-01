# BearGPT Widget Configurator

The BearGPT Widget Configurator is a tool that allows users to easily configure and generate the embed code for a TritonGPT (BearGPT) chat widget.

## Overview

This tool provides a visual interface to set parameters for a chat widget and instantly generates the corresponding `<script>` tag for embedding into any website.

## Features

- **Live Configuration**: Adjust widget settings and see a live preview of the appearance.
- **Parameter Control**:
    - `isStandalone`: Toggles whether the widget runs in standalone mode.
    - `onyxAssistantID`: Specifies the unique ID of the assistant.
    - `showCitations`: Toggles the visibility of citations in the chat.
    - `chatWidgetName`: Sets the name displayed in the widget header.
    - `starterGreeting`: Sets the initial greeting message.
    - `assistantIcon`: Choose from a set of predefined icons (AI, P-C, Skydeck, I-E).
    - `chatWidgetBubble`: Sets the text displayed on the chat bubble.
- **Code Generation**: Automatically generates a script tag pointing to `https://tritongpt.ucsd.edu/widget/v1` with the selected parameters as query strings.
- **One-Click Copy**: Easily copy the generated script tag to the clipboard.

## File Structure

- `index.html`: The complete application (HTML, CSS, and JavaScript) for the configurator.
- `img/`: Contains the icon assets (`.svg` and `.png`) used in the configurator and the generated widgets.

## Usage

1. Open `index.html` in a web browser.
2. Configure the widget parameters using the form on the left.
3. Review the live preview on the right.
4. Copy the generated `<script>` tag from the code output section.
5. Paste the script tag into the HTML of the target website where the widget should appear.
