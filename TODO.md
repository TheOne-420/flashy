- [X] Install dependencies
- [X] Setup database
- [X] Better Auth (using email, password)
- [] Better Auth (using social providers)

---

## Hero Section Enhancements (2025-06-05)

### New Elements Added:

1. **Background Effects**
   - Radial gradient mesh background (purple to blue)
   - Subtle noise/grain texture overlay
   - Ambient glow orbs for depth
   - Floating decorative dots

2. **Headline Improvements**
   - Gradient text on "boring" word
   - Added AI-powered badge above headline
   - New subheadline explaining value proposition

3. **CTA Buttons**
   - Primary: "Start Learning Free" with gradient + glow effect
   - Secondary: "Watch Demo" with play icon
   - Hover animations with scale + glow

4. **Subject Chips**
   - 5 subject chips: Math, Science, History, Languages, Bio
   - Staggered reveal animation
   - Hover lift effect

5. **Stats Bar**
   - 3 stats: 2M+ Cards Created, 500K+ Active Students, 98% Pass Rate
   - Animated counter effect
   - Icon + number + label layout

6. **Trust Badges**
   - "Secure & Private" with shield icon
   - "Free Forever" with infinity icon

7. **Floating Widgets**
   - Streak Counter (top-left): Shows 12-day streak with fire animation
   - AI Tutor Preview (top-right): Shows AI feature with mock conversation
   - Testimonial (left side): Rotating quotes from students
   - Activity Feed (bottom): Live activity showing user actions

8. **Enhanced Flip Cards**
   - Better gradient backgrounds
   - Improved shadows and borders
   - Maintained same flip animation

9. **Animations (GSAP)**
   - Staggered entrance animations
   - Badge → Headline → Subheadline sequence
   - Subject chips stagger in
   - Stats count up

### File Changes:
- `src/components/view/Hero.tsx` - Complete rewrite with all new elements

### Technologies Used:
- GSAP (already installed) for animations
- Lucide icons (already installed)
- Native CSS animations where appropriate

### Responsive Considerations:
- Subject chips wrap on mobile
- Stats bar wraps on mobile
- Flip cards scale down on smaller screens
- CTAs stack on mobile, side-by-side on desktop