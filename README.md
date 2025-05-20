# Nerdy Minesweeper

This is a web-based Minesweeper clone that allows you to customize how the numbers representing nearby mines are displayed.

## Features

- Classic Minesweeper gameplay
- Three difficulty levels: Beginner, Intermediate, and Expert
- Left-click to reveal cells
- Right-click to cycle through flag and question mark
- Chord clicking (click on a revealed number to reveal adjacent cells)
- Timer to track your game duration
- Mine counter showing remaining mines
- First click protection (you'll never hit a mine on your first click)
- Sound effects for game actions (with mute option)
- Game over screen with statistics
- Customizable functions for displaying nearby mine counts
- Preset display modes (Numbers, Squared Values, Letters, Roman Numerals, Emoji)
- Custom formula editor for creating your own display functions
- Automatic fraction display for non-integer results
- Modern UI with responsive design

## How to Play

1. Open `index.html` in your web browser
2. Select a difficulty level
3. Left-click to reveal cells
4. Right-click to place flags or question marks on suspected mine locations
5. Click on revealed numbers to chord-click (reveal adjacent cells when correctly flagged)
6. Clear all non-mine cells to win the game

## Customizing Display Functions

You can customize how the numbers are displayed in revealed cells:

1. Select a preset display function from the dropdown
2. Or enter your own custom function in the input field
3. Use `x` as the variable representing the mine count
4. Click "Apply" to use your custom function
5. Click "Test" to see the output for all possible values

Examples of custom functions:
- `x * 2` (doubles the number)
- `x ** 2` (squares the number)
- `x / 2` (shows as a fraction)
- `['💣', '⚠️', '❗'][x-1]` (uses symbols)

## Project Structure

- `index.html` - Main HTML structure
- `styles.css` - CSS styling for the game
- `script.js` - Game logic and functionality
- `sounds/` - Directory containing sound effect files

## Sound Effects

The game uses the following sound effects:
- Cell click
- Flag placement
- Mine explosion
- Victory sound

Place MP3 files in the `sounds/` directory with the following names:
- `click.mp3`
- `flag.mp3`
- `explosion.mp3`
- `win.mp3`
