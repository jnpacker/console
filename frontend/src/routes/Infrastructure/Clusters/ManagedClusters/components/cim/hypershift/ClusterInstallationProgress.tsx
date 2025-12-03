/* Copyright Contributors to the Open Cluster Management project */
// Local copy that uses modified NodePoolsProgress
import * as React from 'react';
import { ProgressStepper, Stack, StackItem } from '@patternfly/react-core';
import {
  AgentK8sResource,
  ConfigMapK8sResource,
  SecretK8sResource,
  AgentMachineK8sResource,
  HostedClusterK8sResource,
  NodePoolK8sResource,
  NodePoolPatches,
} from '@openshift-assisted/ui-lib/cim';
import HostedClusterProgress from './HostedClusterProgress';
import HypershiftKubeconfigDownload from './HypershiftKubeconfigDownload';
import NodePoolsProgress from './NodePoolsProgress';

type ClusterInstallationProgressProps = {
  agents: AgentK8sResource[];
  agentMachines: AgentMachineK8sResource[];
  hostedCluster: HostedClusterK8sResource;
  fetchSecret: (name: string, namespace: string) => Promise<SecretK8sResource>;
  nodePools: NodePoolK8sResource[];
  onRemoveNodePool: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  onUpdateNodePool: (
    nodePool: NodePoolK8sResource,
    nodePoolPatches: NodePoolPatches,
  ) => Promise<unknown>;
  onAddNodePool: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  launchToOCP: (urlSuffix: string, newTab?: boolean) => void;
  supportedVersionsCM?: ConfigMapK8sResource;
  vmwareTemplates?: any[]; // VMwareNodePoolTemplate[]
};

const ClusterInstallationProgress = ({
  hostedCluster,
  fetchSecret,
  launchToOCP,
  vmwareTemplates,
  ...rest
}: ClusterInstallationProgressProps) => (
  <Stack hasGutter>
    <StackItem>
      <ProgressStepper isVertical>
        <HostedClusterProgress hostedCluster={hostedCluster} launchToOCP={launchToOCP} />
        <NodePoolsProgress hostedCluster={hostedCluster} vmwareTemplates={vmwareTemplates} {...rest} />
      </ProgressStepper>
    </StackItem>
    <StackItem>
      <HypershiftKubeconfigDownload hostedCluster={hostedCluster} fetchSecret={fetchSecret} />
    </StackItem>
  </Stack>
);

export default ClusterInstallationProgress;
