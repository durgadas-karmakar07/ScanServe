// Many buttons move focus when pressed: Add turns into the stepper, a removed line hands focus to
// the next one, closing a sheet returns focus to the button that opened it. A held Enter key keeps
// repeating, and those repeats would then press the new button too (removing other dishes, or
// reopening the sheet just closed). This drops repeated Enter presses that land on a different
// element from where the press started. Holding Enter on one button still repeats as normal.
export function installKeyRepeatGuard() {
  let startedOn = null;
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Enter') return;
      if (!event.repeat) startedOn = event.target;
      else if (event.target !== startedOn) event.preventDefault();
    },
    true,
  );
}
