# Audio Setup Guide

## Adding a Bounce Sound

To add a real bounce sound to your app:

### Option 1: Local Audio File (Recommended)
1. Download a short bounce/click sound (MP3 or WAV format)
2. Rename it to `bounce.mp3`
3. Place it in the `assets/` folder
4. The app will automatically use this local file

### Option 2: Online Audio File
The app currently uses an online sound as a fallback, but this requires internet connection.

### Recommended Sound Characteristics:
- **Duration**: 0.1-0.3 seconds
- **Format**: MP3 or WAV
- **Volume**: Moderate (not too loud)
- **Type**: Soft click, bell, or gentle bounce sound

### Free Sound Resources:
- [Freesound.org](https://freesound.org/) - Search for "bounce", "click", or "bell"
- [Zapsplat](https://www.zapsplat.com/) - Free sound effects
- [SoundBible](http://soundbible.com/) - Free sound effects

### Example Search Terms:
- "soft bounce"
- "gentle click"
- "bell ring"
- "ping sound"
- "notification sound"

## Testing the Audio
1. Start the app
2. Press the "Start" button to begin the animation
3. You should hear the bounce sound when the ball hits walls
4. Use the "Sound On/Off" button to toggle audio

## Troubleshooting
- If you don't hear sound, check your device volume
- Make sure the sound file is properly formatted (MP3 or WAV)
- Check the console logs for any audio loading errors 