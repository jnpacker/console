/* Copyright Contributors to the Open Cluster Management project */
// Local utility functions copied from ui-lib to avoid package export restrictions

import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import React from 'react';
import { global_palette_green_500 as okColor } from '@patternfly/react-tokens/dist/js/global_palette_green_500';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens/dist/js/global_danger_color_100';
import { global_warning_color_100 as warningColor } from '@patternfly/react-tokens/dist/js/global_warning_color_100';
import {
  AgentK8sResource,
  AgentMachineK8sResource,
  HostedClusterK8sResource,
  NodePoolK8sResource,
} from '@openshift-assisted/ui-lib/cim';

const CLUSTER_NAME_LABEL = 'cluster.x-k8s.io/cluster-name';
const NODEPOOL_NAME_ANNOTATION = 'hypershift.openshift.io/nodePool';

export const getNodepoolAgents = (
  nodePool: NodePoolK8sResource,
  agents: AgentK8sResource[],
  agentMachines: AgentMachineK8sResource[],
  hostedCluster: HostedClusterK8sResource,
) => {
  const nodePoolAgentMachines = agentMachines
    .filter(
      (am) =>
        am.metadata?.namespace ===
          `${hostedCluster.metadata?.namespace || ''}-${hostedCluster.metadata?.name || ''}` &&
        am.metadata?.labels?.[CLUSTER_NAME_LABEL] === hostedCluster.spec.infraID &&
        am.metadata?.annotations?.[NODEPOOL_NAME_ANNOTATION] ===
          `${nodePool.metadata?.namespace || ''}/${nodePool.metadata?.name || ''}` &&
        am.status?.agentRef?.name &&
        am.status?.agentRef?.namespace,
    )
    .reduce((acc, curr) => {
      acc[curr.status?.agentRef?.name || ''] = curr.status?.agentRef?.namespace;
      return acc;
    }, {} as Record<string, string | undefined>);

  return agents.filter(
    (a) => nodePoolAgentMachines[a.metadata?.name || ''] === a.metadata?.namespace,
  );
};

export type NodePoolStatus = {
  type: 'error' | 'pending' | 'ok' | 'warning';
  text: string;
  icon: React.ReactNode;
};

// Simplified version - doesn't check agent status details, just counts
export const getNodePoolStatus = (
  nodePool: NodePoolK8sResource,
  agents: AgentK8sResource[],
  t: any,
): NodePoolStatus => {
  if (!agents.length && nodePool.spec.replicas) {
    return {
      type: 'pending',
      icon: React.createElement(InProgressIcon),
      text: t('Pending host assignment'),
    };
  }

  // Check if nodepool is ready
  return nodePool.status?.conditions?.find(({ type }) => type === 'Ready')?.status === 'True'
    ? {
        type: 'ok',
        icon: React.createElement(CheckCircleIcon, { color: okColor.value }),
        text: t('Ready'),
      }
    : {
        type: 'pending',
        icon: React.createElement(InProgressIcon),
        text: t('Not ready'),
      };
};

// Helper function to format file size
export const fileSize = (bytes: number, decimals: number = 2, type: 'si' | 'iec' = 'si'): string => {
  if (bytes === 0) return '0 Bytes';

  const k = type === 'si' ? 1000 : 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = type === 'si'
    ? ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Helper to get hardware info from inventory
export const getHostRowHardwareInfo = (inventory: any) => {
  const cpu = inventory.cpu || {};
  const memory = inventory.memory || {};
  const disks = inventory.disks || [];

  const totalDisk = disks.reduce((acc: number, disk: any) => acc + (disk.sizeBytes || 0), 0);

  return {
    cores: {
      title: cpu.count?.toString() || '-',
      sortableValue: cpu.count || 0,
    },
    memory: {
      title: memory.physicalBytes ? fileSize(memory.physicalBytes, 2, 'iec') : '-',
      sortableValue: memory.physicalBytes || 0,
    },
    disk: {
      title: totalDisk ? fileSize(totalDisk, 2, 'si') : '-',
      sortableValue: totalDisk,
    },
  };
};
