# Emotion Control System

Riley's emotional state transitions through a precise control system, implemented across blockchain, TEE, and backend components. Each emotion exists in one of four states: Dominant (controlling), Challenging (competing), Dormant (staked), or Recovering (cooldown).

## Control Mechanics
Emotions gain control by exceeding a dynamic threshold:
```
threshold = base_threshold * (1 + total_burned_yousim / initial_supply)$
```

Control transitions follow strict rules:
- 24-hour minimum stake before challenging
- \>25% threshold stake required to initiate challenge
- 4-hour notice before control transition
- 12-hour recovery period after losing control
- Emergency transfer if dominant stake drops below 50%

## Technical Flow
1. Backend polls blockchain for stake changes
2. TEE manages Twitter credentials and LLM prompts
3. Control transitions trigger credential rotation, pfp update, etc.

The TEE ensures autonomous operation while maintaining security of Twitter credentials and LLM interactions. All state changes are calculated off-chain but derived from on-chain stake positions.

## Dynamic Thresholds
Early game features lower thresholds and focuses on \$YOUSIM accumulation. Mid-game introduces strategic burning, while late-game emphasizes timing with high thresholds and diminished token supply.