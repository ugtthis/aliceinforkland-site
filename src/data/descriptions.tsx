// ============================================================================
// DATA SOURCE DESCRIPTIONS
// ============================================================================

export type DataSourceContent = {
  paragraphs: string[]
  reference?: {
    text: string
    url: string
  }

  /**
   * Use when description exceeds 211 characters.
   * Prevents the description container from overflowing.
   */
  expandableContent?: {
    sections: {
      title: string
      paragraphs: string[]
      link?: {
        text: string
        url: string
      }
    }[]
  }
}

export const DATA_SOURCE_CONTENT: Record<string, DataSourceContent> = {
  sunnypilot: {
    paragraphs: [
      "sunnypilot is an open source driver assistance system which offers the user a unique driving experience for over 350 supported car makes and models with modified behaviors of driving assist engagements.",
    ],
    expandableContent: {
      sections: [
        {
          title: '',
          paragraphs: [
            "sunnypilot complies with the safety policy from comma.ai's openpilot as accurately as possible.",
          ],
        },
      ],
    },
    reference: {
      text: "Github",
      url: "https://github.com/sunnypilot/sunnypilot",
    },
  },
  frogpilot: {
    paragraphs: [
      "FrogPilot is a fully open-source, frog-themed, and highly customizable fork of openpilot. Built with clean commits and a strong focus on serving the community."
    ],
    expandableContent: {
      sections: [
        {
          title: '',
          paragraphs: [
            "Shaped by both user and developer contributions, FrogPilot embraces collaborative, community-driven development to deliver a cutting-edge openpilot experience for everyone.",
          ],
        },
      ],
    },
    reference: {
      text: "Github",
      url: "https://github.com/FrogAi/FrogPilot",
    },
  },
  bluepilot: {
    paragraphs: [
      "BluePilot is a fork of openpilot specifically developed for Ford vehicles. It works by directly tapping into the IPMA, bypassing the limitations of the stock Lane Centering features.",
    ],
    reference: {
      text: "Github",
      url: "https://github.com/BluePilotDev/bluepilot",
    },
  },
  openpilot: {
    paragraphs: [
      "The upstream codebase for downstream forks, openpilot is an operating system for robotics maintained by comma. Currently, it upgrades the driver assistance system on 300+ supported cars.",
    ],
    reference: {
      text: "Github",
      url: "https://github.com/commaai/openpilot",
    },
  },
}

// ============================================================================
// FEATURE DESCRIPTIONS (Dynamic)
// ============================================================================

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

