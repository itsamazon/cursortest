# Bouncing Ball App - Calming Meditation App

A soothing mobile app featuring a gently bouncing ball with calming sounds to help reduce stress and anxiety.

## 🎯 Features

### 🏀 Bounce Mode
- **Calming Animation**: Smooth, slow-moving bouncing ball
- **Soothing Sounds**: Gentle bounce sounds when the ball hits walls
- **Customizable Ball**: Change colors and speed to your preference
- **Trail Effects**: Beautiful trailing animation behind the ball

### 🫁 Breathe Mode
- **Breathing Presets**: Coherent (5-5), Box (4-4-4-4), 4-7-8 patterns
- **Visual Breathing Guide**: Ball expands and contracts with your breath
- **Progress Ring**: Circular progress indicator for each breathing phase
- **Haptic Feedback**: Gentle vibrations for phase transitions
- **Ambient Sounds**: Optional background brown noise for relaxation
- **Interactive Ball**: Pinch to resize, long press to squeeze

### 🌟 General Features
- **Dual Mode App**: Switch between Bounce and Breathe modes
- **Meditation Aid**: Perfect for stress relief and relaxation
- **Accessibility**: Full VoiceOver/TalkBack support
- **Beautiful Design**: Dark theme with glowing effects

## 📱 How to Test the App

### Option 1: Using Expo Go (Easiest)

1. **Install Expo Go** on your phone**:
   - **iOS**: Search "Expo Go" in App Store
   - **Android**: Search "Expo Go" in Google Play Store

2. **Start the development server**:
   ```bash
   cd BouncingBallApp
   npm install
   npx expo start
   ```

3. **Share the app**:
   - **QR Code**: Scan the QR code with your phone
   - **Link**: Share the Expo link that appears in the terminal
   - **Email**: Send the Expo link via email

4. **Test the app**:
   - **Mode Toggle**: Switch between "🏀 Bounce" and "🫁 Breathe" modes
   - **Bounce Mode**: 
     - Tap "Start" to begin the calming animation
     - Watch the ball bounce slowly and smoothly
     - Listen for gentle bounce sounds
     - Use "⚙️ Settings" to customize colors and speed
   - **Breathe Mode**:
     - Choose from 3 breathing presets
     - Follow the visual breathing guide
     - Use pinch and long press gestures
     - Toggle ambient sounds

### Option 2: Share via Expo Link

Once the app is running, you'll see a link like:
```
https://expo.dev/@yourusername/calming-ball
```

**Share this link** with anyone who wants to test the app. They can:
1. Open the link on their phone
2. Tap "Open in Expo Go"
3. The app will load automatically

### Option 2: Using Simulator/Emulator

1. **For iOS Simulator**:
   ```bash
   npx expo start
   # Press 'i' to open iOS simulator
   ```

2. **For Android Emulator**:
   ```bash
   npx expo start
   # Press 'a' to open Android emulator
   ```

3. **For Web Browser**:
   ```bash
   npx expo start
   # Press 'w' to open in web browser
   ```

## 🎵 Adding Custom Sounds

### Bounce Mode Sounds
To add your own bounce sound:

1. Download a short sound file (0.1-0.3 seconds, MP3 or WAV)
2. Rename it to `bounce.mp3`
3. Place it in the `assets/` folder
4. The app will automatically use this sound

### Breathe Mode Sounds
The breathing mode includes:
- **Chime sounds** for phase transitions
- **Ambient brown noise** for background relaxation
- **Haptic feedback** for tactile guidance

See `AUDIO_SETUP.md` for detailed instructions.

## 🛠️ Development Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn
- Expo CLI (optional, can use npx)

### Installation
```bash
# Clone or download the project
cd BouncingBallApp

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Project Structure
```
BouncingBallApp/
├── App.js                    # Main app component with mode toggle
├── components/               # Reusable components
│   └── breathe/             # Breathing mode components
│       ├── PRESETS.ts       # Breathing patterns and colors
│       ├── useBreathingCycle.ts # Breathing cycle logic
│       ├── SegmentedControl.tsx # Preset selection
│       ├── BreathingBall.tsx    # Animated breathing ball
│       ├── ProgressRing.tsx     # Phase progress indicator
│       ├── SqueezableWrapper.tsx # Gesture handling
│       └── BreatheMode.tsx      # Main breathing interface
├── assets/                  # Images and sounds
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## 🎨 Customization

### User Customization (In-App)
- **Tap the "⚙️ Settings" button** to open the customization panel
- **Change Ball Color**: Choose from 8 beautiful colors including cyan, red, green, blue, and more
- **Adjust Ball Speed**: Use + and - buttons to set speed from 0.5x to 3.0x
- **Toggle Sound**: Enable/disable bounce sounds

### Developer Customization
Edit the code in `App.js`:

#### Changing Default Ball Speed
```javascript
const [ballSpeed, setBallSpeed] = useState(1.5); // Default speed
```

#### Adding More Colors
```javascript
{['#4dd0e1', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'].map((color) => (
  // Add your custom colors here
))}
```

#### Changing Speed Range
```javascript
onPress={() => updateBallSpeed(Math.max(0.5, ballSpeed - 0.2))} // Min speed
onPress={() => updateBallSpeed(Math.min(3.0, ballSpeed + 0.2))} // Max speed
```

## 🐛 Troubleshooting

### Common Issues

1. **"Expo command not found"**
   - Use `npx expo start` instead of `expo start`

2. **"Port already in use"**
   - Press 'y' when prompted to use a different port

3. **"Cannot read property 'prototype'"**
   - This is normal - the app will still work

4. **No sound playing**
   - Check device volume
   - Make sure sound is enabled in the app
   - Check console logs for audio errors

### Getting Help
- Check the console logs for error messages
- Make sure all dependencies are installed
- Try clearing the cache: `npx expo start --clear`

## 📋 Testing Checklist

- [ ] App starts without errors
- [ ] Ball moves smoothly when "Start" is pressed
- [ ] Ball stops when "Pause" is pressed
- [ ] Sound plays when ball hits walls (if enabled)
- [ ] Sound toggle button works
- [ ] App works on different screen sizes
- [ ] No performance issues or lag

## 🚀 Next Steps

### Breathing Mode Enhancements
- Add more breathing patterns (Triangle, 4-4-6, etc.)
- Custom breathing pattern creator
- Breathing statistics and progress tracking
- Guided voice instructions
- Integration with health apps

### General Improvements
- Add different ball colors/themes
- Add background music options
- Add meditation timer
- Add different ball shapes
- Add particle effects
- Export breathing session data

---

**Enjoy your calming meditation experience! 🧘‍♀️✨**