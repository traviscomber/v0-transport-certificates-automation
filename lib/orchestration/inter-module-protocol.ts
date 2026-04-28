/**
 * Inter-Module Communication Protocol - IMCP
 * Protocolo para que los módulos se comuniquen entre sí
 * Define interfaces estándar para que los módulos "conversen"
 */

import { ModuleContext, ModuleEvent, ModuleAction } from './module-orchestrator'
import { Prediction, BehaviorPattern } from './shared-intelligence'

/**
 * Interfaz estándar que todo módulo debe implementar
 */
export interface IModule {
  name: string
  version: string
  dependencies: string[]

  /**
   * Inicializar el módulo
   */
  initialize(): Promise<void>

  /**
   * Procesar un evento enviado por otro módulo
   */
  processEvent(event: ModuleEvent): Promise<void>

  /**
   * Ejecutar una acción solicitada por otro módulo
   */
  executeAction(action: ModuleAction): Promise<any>

  /**
   * Obtener el estado actual del módulo
   */
  getState(): Promise<any>

  /**
   * Solicitar información específica
   */
  query(query: ModuleQuery): Promise<any>
}

/**
 * Consulta que un módulo puede hacer a otro
 */
export interface ModuleQuery {
  type: string
  parameters: Record<string, any>
  responseFormat?: 'json' | 'array' | 'count'
}

/**
 * Respuesta a una consulta
 */
export interface ModuleResponse {
  success: boolean
  data?: any
  error?: string
  timestamp: Date
}

/**
 * Receptor de solicitudes de otros módulos
 */
export abstract class ModuleReceiver implements IModule {
  abstract name: string
  abstract version: string
  abstract dependencies: string[]

  async initialize(): Promise<void> {
    console.log(`[${this.name}] Initializing...`)
  }

  async processEvent(event: ModuleEvent): Promise<void> {
    console.log(`[${this.name}] Received event: ${event.type}`)
  }

  async executeAction(action: ModuleAction): Promise<any> {
    console.log(`[${this.name}] Executing action: ${action.type}`)
    return null
  }

  async getState(): Promise<any> {
    return {
      name: this.name,
      version: this.version,
      timestamp: new Date(),
    }
  }

  async query(query: ModuleQuery): Promise<any> {
    throw new Error(`Query type '${query.type}' not supported`)
  }
}

/**
 * Gestor de comunicación entre módulos
 */
export class InterModuleCommunicationHub {
  private modules: Map<string, IModule> = new Map()
  private requestHistory: Array<{
    from: string
    to: string
    type: string
    timestamp: Date
    duration: number
  }> = []

  /**
   * Registra un módulo en el hub
   */
  registerModule(module: IModule) {
    console.log(`[IMCP Hub] Registering module: ${module.name}`)
    this.modules.set(module.name, module)
  }

  /**
   * Envía un evento a todos los módulos interesados
   */
  async broadcastEvent(event: ModuleEvent) {
    console.log(`[IMCP Hub] Broadcasting event: ${event.type} from ${event.source}`)

    const startTime = Date.now()
    const promises = Array.from(this.modules.values())
      .filter(m => m.name !== event.source)
      .map(async module => {
        try {
          await module.processEvent(event)
        } catch (error) {
          console.error(
            `[IMCP Hub] Error in ${module.name}.processEvent:`,
            error
          )
        }
      })

    await Promise.all(promises)

    this.requestHistory.push({
      from: event.source,
      to: 'broadcast',
      type: event.type,
      timestamp: new Date(),
      duration: Date.now() - startTime,
    })
  }

  /**
   * Envía un evento a un módulo específico
   */
  async sendEvent(targetModule: string, event: ModuleEvent) {
    const module = this.modules.get(targetModule)
    if (!module) {
      throw new Error(`Module ${targetModule} not found`)
    }

    console.log(
      `[IMCP Hub] Sending event to ${targetModule}: ${event.type}`
    )

    const startTime = Date.now()
    try {
      await module.processEvent(event)
      this.requestHistory.push({
        from: event.source,
        to: targetModule,
        type: event.type,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      })
    } catch (error) {
      console.error(
        `[IMCP Hub] Error sending event to ${targetModule}:`,
        error
      )
      throw error
    }
  }

  /**
   * Ejecuta una acción en un módulo
   */
  async executeAction(action: ModuleAction): Promise<any> {
    const module = this.modules.get(action.targetModule)
    if (!module) {
      throw new Error(`Module ${action.targetModule} not found`)
    }

    console.log(
      `[IMCP Hub] Executing action on ${action.targetModule}: ${action.type}`
    )

    const startTime = Date.now()
    try {
      const result = await module.executeAction(action)
      this.requestHistory.push({
        from: 'orchestrator',
        to: action.targetModule,
        type: action.type,
        timestamp: new Date(),
        duration: Date.now() - startTime,
      })
      return result
    } catch (error) {
      console.error(
        `[IMCP Hub] Error executing action on ${action.targetModule}:`,
        error
      )
      throw error
    }
  }

  /**
   * Realiza una consulta a un módulo
   */
  async queryModule(
    targetModule: string,
    query: ModuleQuery
  ): Promise<ModuleResponse> {
    const module = this.modules.get(targetModule)
    if (!module) {
      return {
        success: false,
        error: `Module ${targetModule} not found`,
        timestamp: new Date(),
      }
    }

    try {
      const data = await module.query(query)
      return {
        success: true,
        data,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      }
    }
  }

  /**
   * Obtiene el estado de todos los módulos
   */
  async getModulesStatus() {
    const status: Record<string, any> = {}

    for (const [name, module] of this.modules) {
      try {
        status[name] = await module.getState()
      } catch (error) {
        status[name] = { error: 'Failed to get state' }
      }
    }

    return status
  }

  /**
   * Obtiene el historial de comunicaciones
   */
  getRequestHistory(limit = 100) {
    return this.requestHistory.slice(-limit)
  }

  /**
   * Obtiene estadísticas de comunicación
   */
  getCommunicationStats() {
    const totalRequests = this.requestHistory.length
    const avgDuration =
      this.requestHistory.reduce((sum, r) => sum + r.duration, 0) /
      totalRequests || 0

    const requestsByModule = this.requestHistory.reduce(
      (acc, r) => {
        acc[r.from] = (acc[r.from] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const requestsByType = this.requestHistory.reduce(
      (acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      totalRequests,
      averageDuration: avgDuration.toFixed(2),
      requestsByModule,
      requestsByType,
      slowestRequests: this.requestHistory
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5),
    }
  }
}

/**
 * Contexto de llamada entre módulos
 */
export interface CallContext {
  callerId: string
  targetId: string
  startTime: Date
  endTime?: Date
  duration?: number
  error?: string
}

/**
 * Decorador para rastrear llamadas inter-módulos
 */
export function TrackedCall(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now()
    const moduleName = (this as any)?.name || target.constructor?.name || 'Unknown'
    
    try {
      const result = await originalMethod.apply(this, args)
      const duration = Date.now() - startTime
      console.log(
        `[${moduleName}] ${propertyKey} completed in ${duration}ms`
      )
      return result
    } catch (error) {
      console.error(
        `[${moduleName}] ${propertyKey} failed:`,
        error
      )
      throw error
    }
  }

  return descriptor
}

// Instancia singleton del hub
export const imcpHub = new InterModuleCommunicationHub()
