# Usability Validation Protocol (SC-003)

## Objective

Validate that a user can complete a core add-edit-export flow efficiently with keyboard and pointer controls.

## Scenario

1. Open the editor and select a text element from the Layers panel.
2. Update text content in Inspector.
3. Change text color in Inspector.
4. Trigger export using keyboard shortcut (Ctrl/Cmd+E).

## Metrics

- SC-003 completion time target: under 3 minutes for first-time guided run.
- Error threshold: no blocking errors; non-blocking status updates allowed.

## Procedure

1. Run the app in local dev mode.
2. Record screen and timing for each participant.
3. Capture completion time and any friction notes.
4. Repeat across at least 3 participants.

## Pass Criteria

- Median completion time meets SC-003 target.
- Export operation completes successfully in all runs.
- Keyboard navigation and focus visibility are acceptable for all participants.

## Troubleshooting

- If export fails, inspect operation status banner and console output.
- If keyboard shortcuts do not trigger, verify browser modifier key behavior.
