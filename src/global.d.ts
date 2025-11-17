import { TodoCLI } from './utils/cli'

declare global {
  interface Window {
    todo?: TodoCLI
  }
}

export {}
