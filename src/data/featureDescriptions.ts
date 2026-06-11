export const getACCDescription = (longitudinal: string): string => {
  switch (longitudinal) {
    case 'openpilot':
      return `Full openpilot Adaptive Cruise Control (ACC) with automatic speed and following distance control. ` +
        `openpilot handles all longitudinal control including acceleration, deceleration, and maintaining safe ` +
        `following distances.`
    case 'openpilot available':
      return `openpilot Adaptive Cruise Control (ACC) is available as an option but requires enabling. ` +
        `When enabled, openpilot provides enhanced longitudinal control with automatic speed and following ` +
        `distance management.`
    case 'Stock':
      return `Uses the vehicle's factory Adaptive Cruise Control (ACC) system. openpilot provides steering ` +
        `assistance but relies on the car's built-in cruise control for speed management.`
    default:
      return `Adaptive Cruise Control (ACC) maintains a safe following distance from the vehicle ahead.`
  }
}

export const getAutoResumeDescription = (autoResume: boolean): string => {
  if (autoResume) {
    return `Automatically resumes from a complete stop when traffic ahead starts moving again. ` +
      `This feature works with openpilot's Adaptive Cruise Control and eliminates the need to manually ` +
      `restart cruise control after coming to a stop in traffic.`
  } else {
    return `Does not automatically resume from a complete stop. When traffic stops, you'll need to manually ` +
      `press the accelerator or cruise control button to resume after the vehicle ahead starts moving again.`
  }
}
