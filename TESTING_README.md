# Testing Guide for Telegram Tap Counter

This guide explains how to test the Telegram Tap Counter Mini App using the provided testing tools.

## Testing Files

1. **TESTING_CHECKLIST.md** - Comprehensive manual testing checklist covering all requirements
2. **test-runner.html** - Automated test runner for performance and functional tests
3. **TESTING_README.md** - This file

## Quick Start

### Option 1: Manual Testing with Checklist

1. Open `TESTING_CHECKLIST.md`
2. Follow the checklist section by section
3. Mark each test as Pass/Fail
4. Document any issues found
5. Complete the testing summary at the end

### Option 2: Automated Testing

1. Open `test-runner.html` in a web browser
2. Click "Run All Tests" to execute automated tests
3. Review the results and performance metrics
4. Use the live app preview to perform manual tests

### Option 3: Test in Telegram

1. Deploy the app to a public URL (GitHub Pages, Vercel, etc.)
2. Create a Telegram bot via @BotFather
3. Set up the Mini App using `/newapp` command
4. Open the app in Telegram
5. Follow the "Quick Testing Guide for Telegram" section in TESTING_CHECKLIST.md

## Testing Priority

### Critical Tests (Must Pass)
- Tap functionality with mouse and touch events
- Score increments correctly
- High score persistence across reloads
- Reset preserves high score
- Responsive layout on mobile devices
- No console errors

### Important Tests (Should Pass)
- Score displays within 100ms
- Animations run smoothly at 60fps
- Telegram theme integration
- Share functionality in Telegram
- localStorage fallback behavior

### Optional Tests (Nice to Have)
- Cross-browser compatibility
- Performance benchmarks
- Edge cases and error handling

## Performance Targets

- **Initial Load Time:** < 1 second
- **Tap Response Time:** < 100ms
- **Frame Rate:** ~60 FPS
- **Memory Usage:** Stable (no leaks)

## Testing in Different Environments

### Local Testing (Browser)
```bash
# Serve the app locally
python3 -m http.server 8000
# or
npx serve .
```
Then open http://localhost:8000 in your browser

### Telegram Desktop Testing
1. Deploy to public URL
2. Configure Mini App in @BotFather
3. Open in Telegram Desktop
4. Test with light and dark themes

### Telegram Mobile Testing
1. Use the same deployed URL
2. Open in Telegram mobile app (iOS/Android)
3. Test touch events and responsive layout
4. Verify theme integration

## Common Issues and Solutions

### Issue: localStorage not working
**Solution:** Check browser privacy settings, try different browser, or test incognito mode

### Issue: Telegram SDK not available
**Solution:** This is expected when testing outside Telegram. Share button will be disabled.

### Issue: Animations are laggy
**Solution:** Check browser performance, close other tabs, test on different device

### Issue: Touch events not working
**Solution:** Ensure testing on actual touch device, not mouse simulation

## Reporting Issues

When reporting issues, include:
1. Test case that failed
2. Expected behavior
3. Actual behavior
4. Environment (browser, device, OS)
5. Screenshots or console errors
6. Steps to reproduce

## Performance Testing Tools

### Browser DevTools
- **Performance Tab:** Record and analyze runtime performance
- **Network Tab:** Check load times and resource sizes
- **Memory Tab:** Monitor memory usage and detect leaks
- **Console Tab:** Check for errors and warnings

### Lighthouse
```bash
# Run Lighthouse audit
lighthouse http://localhost:8000 --view
```

### Manual Performance Testing
1. Open DevTools Performance tab
2. Click Record
3. Tap button 20-30 times
4. Stop recording
5. Analyze:
   - Frame rate (should be ~60fps)
   - Long tasks (should be minimal)
   - Animation smoothness

## Test Coverage

The testing checklist covers:
- ✅ All 5 user stories from requirements
- ✅ All 20 acceptance criteria
- ✅ Performance requirements (100ms response, 60fps)
- ✅ Responsive design (320px to 1920px)
- ✅ Telegram integration (themes, share, SDK)
- ✅ Error handling and edge cases
- ✅ Cross-browser compatibility
- ✅ localStorage fallback behavior

## Automated Test Runner Features

The `test-runner.html` provides:
- Functional tests (DOM, localStorage, SDK detection)
- Performance tests (load time, response time, FPS)
- Real-time metrics display
- Live app preview in iframe
- One-click test execution

## Next Steps After Testing

1. ✅ Complete all critical tests
2. ✅ Document any issues found
3. ✅ Fix critical bugs
4. ✅ Re-test after fixes
5. ✅ Get sign-off from tester
6. ✅ Deploy to production

## Support

For questions or issues with testing:
1. Check the TESTING_CHECKLIST.md for detailed test cases
2. Review the design.md and requirements.md for specifications
3. Check browser console for error messages
4. Test in multiple environments to isolate issues

---

**Happy Testing! 🎮**
