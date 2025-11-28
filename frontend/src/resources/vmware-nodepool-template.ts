/* Copyright Contributors to the Open Cluster Management project */
import { Metadata } from './metadata'
import { IResource, IResourceDefinition } from './resource'

export const VMwareNodePoolTemplateApiVersion = 'vmware.hcp.open-cluster-management.io/v1alpha1'
export type VMwareNodePoolTemplateApiVersionType = 'vmware.hcp.open-cluster-management.io/v1alpha1'

export const VMwareNodePoolTemplateKind = 'VMwareNodePoolTemplate'
export type VMwareNodePoolTemplateKindType = 'VMwareNodePoolTemplate'

export const VMwareNodePoolTemplateDefinition: IResourceDefinition = {
  apiVersion: VMwareNodePoolTemplateApiVersion,
  kind: VMwareNodePoolTemplateKind,
}

export interface VMwareNodePoolTemplate extends IResource {
  apiVersion: VMwareNodePoolTemplateApiVersionType
  kind: VMwareNodePoolTemplateKindType
  metadata: Metadata
  spec: {
    nodePoolRef: {
      name: string
    }
    vSphereCredentials?: {
      name?: string
    }
    vmTemplate: {
      datacenter: string
      cluster?: string
      resourcePool?: string
      datastore: string
      folder?: string
      network: string
      numCPUs?: number
      memoryMB?: number
      diskSizeGB?: number
      guestID?: string
      firmware?: string
      namePrefix?: string
      extraConfig?: Record<string, string>
      advancedConfig?: {
        diskEnableUUID?: boolean
        nestedVirtualization?: boolean
      }
      resourceLimits?: {
        maxVMs?: number
        softMaxVMs?: number
      }
    }
    agentISO: {
      type: 'datastore' | 'url'
      datastorePath?: string
      url?: string
      uploadedISOName?: string
    }
    agentLabelSelector?: Record<string, string>
    testMode?: boolean
    replicas?: number
    resourcePollingInterval?: string
    useEffectiveCapacity?: boolean
  }
  status?: {
    conditions?: Array<{
      type: string
      status: string
      reason: string
      message: string
      lastTransitionTime: string
      observedGeneration?: number
    }>
    observedGeneration?: number
    desiredReplicas?: number
    currentReplicas?: number
    readyReplicas?: number
    vmStatus?: Array<{
      name: string
      uuid?: string
      serialNumber?: string
      powerState?: string
      agentName?: string
      phase?: string
      message?: string
      lastTransitionTime?: string
    }>
    isoUploaded?: boolean
    isoPath?: string
    resourceUtilization?: {
      datastore: {
        name: string
        capacityGB: number
        freeSpaceGB: number
        usedGB: number
        percentUsed: number
      }
      compute: {
        resourceType: string
        name: string
        cpuTotalMhz: number
        cpuEffectiveMhz: number
        cpuUsedMhz: number
        cpuAvailableMhz: number
        cpuPercentUsed: number
        memoryTotalMb: number
        memoryEffectiveMb: number
        memoryUsedMb: number
        memoryAvailableMb: number
        memoryPercentUsed: number
      }
      estimatedVMCapacity: number
      softLimitExceeded?: boolean
      lastUpdated: string
    }
    resourceValidation?: {
      datacenter: {
        exists: boolean
        message?: string
      }
      cluster?: {
        exists: boolean
        message?: string
      }
      resourcePool?: {
        exists: boolean
        message?: string
      }
      datastore: {
        exists: boolean
        message?: string
      }
      network: {
        exists: boolean
        message?: string
      }
      folder?: {
        exists: boolean
        message?: string
      }
    }
  }
}
