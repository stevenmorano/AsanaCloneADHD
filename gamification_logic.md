# Gamification & Engagement Logic

## 1. Upkeep Streaks (Health Bars)
**Philosophy**: Overdue tasks labeled in bold red text induce shame, guilt, and behavioral shutdown (paralysis). Instead, recurring tasks are represented as "Upkeep Items" with video-game-style health bars.

### Mechanics
- **Initial State**: Completing a task sets its Health to 100%.
- **Degradation Engine**: Over time, the health bar slowly depletes based on the recurrence interval.
  - *Example*: "Bathtub Cleanliness" (recurrence: 3 months). Health drops by roughly 1.1% per day.
  - *Example*: "Take Meds" (recurrence: 1 day). Health drops by 100% per day.
- **Visual Feedback States**:
  - `70% - 100%`: Green vibes, vibrant health. "All good!"
  - `30% - 69%`: Yellow/Orange warned state. "Could use some attention soon."
  - `0% - 29%`: Red, flashing, or visually "grimy" appearance indicating it critically needs attention, but crucially without screaming "OVERDUE" text.
  - **The Heal Action**: Completing the task plays a highly satisfying animation (similar to using a health potion in an RPG/Zelda game) that smoothly fills the bar back up to 100%.

## 2. Quick Win Rewards
**Philosophy**: The "Quick Win" button is an emergency tool to overcome the immense initial friction of starting work. The immediate reward for doing a 3-minute task must feel disproportionately massive to construct a positive dopamine feedback loop.

### Visual & Audio Reward Logic
- **Action Validation**: When a Quick Win chore is checked off, trigger an immediate, punchy micro-interaction. The checkbox shouldn't just turn blue; it should visually shatter, burst into confetti, pop, or light up.
- **Sound Design**: Play a crisp, high-quality audio cue. Think "Level Up", "Item Discovered" (Zelda), or "Coin Collect" (Mario) sound effects that trigger immediate satisfaction. Provide an option for a significant haptic bump on mobile devices.
- **Momentum Linking**: Upon completing a Quick Win, immediately serve a prompt: *"Great job! Use that momentum!"* with frictionless options to:
  - Seamlessly dive into the main Focus Dashboard.
  - Grab another Quick Win chore.
- **Hidden Streak Multiplier**: Maintain a hidden "Quick Win Streak" value. Consecutive quick tasks in a single session make the visual explosion slightly larger, the haptic stronger, or the pitch of the success chime progressively higher to simulate a combot/chain effect.
