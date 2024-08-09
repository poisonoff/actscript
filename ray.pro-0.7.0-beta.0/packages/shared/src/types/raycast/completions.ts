export interface RaycastCompletions {
  debug: boolean
  image_generation_tool: true
  web_search_tool: true
  locale: string
  messages: {
    author: string
    content: {
      system_instructions: string
      command_instructions: string
      text: string
      temperature: number
      attachments: {
        id: string
        type: string
      }[]
      [key: string]: string | number | Record<string, any>
    }
  }[]
  model: string
  provider: string
  source: string
  system_instruction: string
  additional_system_instructions: string
  temperature: number
}
