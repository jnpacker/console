/* Copyright Contributors to the Open Cluster Management project */
import * as React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Form,
  Grid,
  GridItem,
  Progress,
  ProgressVariant,
  ProgressMeasureLocation,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import {
  AgentK8sResource,
  AgentMachineK8sResource,
  HostedClusterK8sResource,
  NodePoolFormValues,
  NodePoolK8sResource,
  getVersionFromReleaseImage,
} from '@openshift-assisted/ui-lib/cim';
import NodePoolAgentsForm from './NodePoolAgentsForm';
import { useTranslation } from '../../../../../../lib/acm-i18next';

type NodePoolFormProps = {
  agents: AgentK8sResource[];
  agentMachines?: AgentMachineK8sResource[];
  hostedCluster: HostedClusterK8sResource;
  nodePool?: NodePoolK8sResource;
  vmwareTemplate?: any; // VMwareNodePoolTemplate
};

const NodePoolForm = ({ agents, nodePool, hostedCluster, agentMachines, vmwareTemplate }: NodePoolFormProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<NodePoolFormValues>();

  const isEdit = !!nodePool && !!agentMachines;

  // REMOVED: Agent availability check - now allows unlimited hosts
  // Set maxAgents to a very high number to effectively remove the limit
  const maxAgents = 999999;

  const ocpVersion = getVersionFromReleaseImage(hostedCluster.spec.release.image);

  return (
    <Form>
      <Grid hasGutter>
        <GridItem>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('Host namespace')}</DescriptionListTerm>
              <DescriptionListDescription>
                {hostedCluster.spec.platform.agent?.agentNamespace}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
        <GridItem>
          {nodePool ? (
            <DescriptionList isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('Nodepool')}</DescriptionListTerm>
                <DescriptionListDescription>{nodePool.metadata?.name}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          ) : (
            <div>
              <label htmlFor="nodePoolName">{t('Nodepool name')}</label>
              <input id="nodePoolName" name="nodePoolName" required />
            </div>
          )}
        </GridItem>
        <GridItem>
          <NodePoolAgentsForm
            agents={agents}
            countName="count"
            labelName="agentLabels"
            autoscalingName={`autoscaling`}
            useAutoscalingName={`useAutoscaling`}
            maxAgents={maxAgents}
            isEdit={isEdit}
            vmwareTemplate={vmwareTemplate}
            currentReplicas={nodePool?.spec.replicas}
          />
        </GridItem>
        {vmwareTemplate && vmwareTemplate.status?.resourceUtilization && (
          <GridItem>
            <Stack hasGutter style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <StackItem>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>{t('VMware Capacity')}</div>
              </StackItem>
              <StackItem>
                <div>
                  <strong>{t('Storage')}</strong>
                  <Progress
                    value={vmwareTemplate.status.resourceUtilization.datastore.percentUsed}
                    title={`${vmwareTemplate.status.resourceUtilization.datastore.freeSpaceGB} GB Free / ${vmwareTemplate.status.resourceUtilization.datastore.capacityGB} GB Total`}
                    variant={
                      vmwareTemplate.status.resourceUtilization.datastore.percentUsed > 90
                        ? ProgressVariant.danger
                        : vmwareTemplate.status.resourceUtilization.datastore.percentUsed > 75
                          ? ProgressVariant.warning
                          : undefined
                    }
                    measureLocation={ProgressMeasureLocation.outside}
                  />
                </div>
              </StackItem>
              <StackItem>
                <div>
                  <strong>{t('CPU')}</strong>
                  <Progress
                    value={vmwareTemplate.status.resourceUtilization.compute.cpuPercentUsed}
                    title={`${vmwareTemplate.status.resourceUtilization.compute.cpuAvailableMhz} MHz Available / ${vmwareTemplate.status.resourceUtilization.compute.cpuTotalMhz} MHz Total`}
                    variant={
                      vmwareTemplate.status.resourceUtilization.compute.cpuPercentUsed > 90
                        ? ProgressVariant.danger
                        : vmwareTemplate.status.resourceUtilization.compute.cpuPercentUsed > 75
                          ? ProgressVariant.warning
                          : undefined
                    }
                    measureLocation={ProgressMeasureLocation.outside}
                  />
                </div>
              </StackItem>
              <StackItem>
                <div>
                  <strong>{t('Memory')}</strong>
                  <Progress
                    value={vmwareTemplate.status.resourceUtilization.compute.memoryPercentUsed}
                    title={`${vmwareTemplate.status.resourceUtilization.compute.memoryAvailableMb} MB Available / ${vmwareTemplate.status.resourceUtilization.compute.memoryTotalMb} MB Total`}
                    variant={
                      vmwareTemplate.status.resourceUtilization.compute.memoryPercentUsed > 90
                        ? ProgressVariant.danger
                        : vmwareTemplate.status.resourceUtilization.compute.memoryPercentUsed > 75
                          ? ProgressVariant.warning
                          : undefined
                    }
                    measureLocation={ProgressMeasureLocation.outside}
                  />
                </div>
              </StackItem>
              <StackItem>
                <div>
                  <strong>{t('Estimated VM Capacity')}</strong>: {vmwareTemplate.status.resourceUtilization.estimatedVMCapacity}
                  {vmwareTemplate.spec?.vmTemplate?.resourceLimits?.maxVMs !== undefined &&
                    ` / ${vmwareTemplate.spec.vmTemplate.resourceLimits.maxVMs} Max VMs`}
                </div>
              </StackItem>
            </Stack>
          </GridItem>
        )}
        {vmwareTemplate && !vmwareTemplate.status?.resourceUtilization && (
          <GridItem>
            <div style={{ fontStyle: 'italic', color: '#6a6e73', padding: '16px' }}>
              {t('VMware resource utilization data is not yet available. The VMware controller will populate this information shortly.')}
            </div>
          </GridItem>
        )}
        <GridItem>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('OpenShift version')}</DescriptionListTerm>
              <DescriptionListDescription>
                {ocpVersion || hostedCluster.spec.release.image}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
      </Grid>
    </Form>
  );
};

export default NodePoolForm;
