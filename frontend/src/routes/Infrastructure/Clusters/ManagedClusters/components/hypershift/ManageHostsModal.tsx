/* Copyright Contributors to the Open Cluster Management project */
import {
  Alert,
  Button,
  Modal,
  ModalBoxBody,
  ModalBoxFooter,
  ModalVariant,
  Progress,
  ProgressVariant,
  ProgressMeasureLocation,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { Formik, FormikConfig } from 'formik';
import * as React from 'react';
import { AgentK8sResource } from '@openshift-assisted/ui-lib/cim';
import {
  NodePoolK8sResource,
  HostedClusterK8sResource,
  AgentMachineK8sResource,
  NodePoolFormValues,
} from '@openshift-assisted/ui-lib/cim';
import NodePoolForm from './NodePoolForm';
import { useTranslation } from '../../../../../../lib/acm-i18next';

// Local helper function to convert labels to Formik value format
const labelsToFormikValue = (labels: Record<string, string>): { key: string; value: string }[] => {
  return Object.entries(labels || {}).map(([key, value]) => ({ key, value }));
};

type ManageHostsModalProps = {
  hostedCluster: HostedClusterK8sResource;
  agents: AgentK8sResource[];
  nodePool: NodePoolK8sResource;
  onClose: VoidFunction;
  onSubmit: (
    nodePool: NodePoolK8sResource,
    nodePoolPatches: {
      op: string;
      value?: unknown;
      path: string;
    }[],
  ) => Promise<unknown>;
  agentMachines: AgentMachineK8sResource[];
  vmwareTemplate?: any; // VMwareNodePoolTemplate
};

const getPatches = (values: NodePoolFormValues, nodePool: NodePoolK8sResource) => {
  const patches = [];

  if (values.useAutoscaling) {
    if (!!nodePool.spec.autoScaling) {
      patches.push({
        op: 'replace',
        value: {
          min: values.autoscaling.minReplicas,
          max: values.autoscaling.maxReplicas,
        },
        path: '/spec/autoScaling',
      });
    } else {
      patches.push(
        { op: 'remove', path: '/spec/replicas' },
        {
          op: 'add',
          value: {
            min: values.autoscaling.minReplicas,
            max: values.autoscaling.maxReplicas,
          },
          path: '/spec/autoScaling',
        },
      );
    }
  } else {
    if (!!nodePool.spec.replicas) {
      patches.push({
        op: 'replace',
        value: values.count,
        path: '/spec/replicas',
      });
    } else {
      patches.push(
        { op: 'remove', path: '/spec/autoScaling' },
        {
          op: 'add',
          value: values.count,
          path: '/spec/replicas',
        },
      );
    }
  }
  return patches;
};

const ManageHostsModal = ({
  onClose,
  nodePool,
  hostedCluster,
  agents,
  onSubmit,
  agentMachines,
  vmwareTemplate,
}: ManageHostsModalProps) => {
  const { t } = useTranslation();
  const [error, setError] = React.useState<string>();
  const namespaceAgents = agents.filter(
    (a) => a.metadata?.namespace === hostedCluster.spec.platform.agent?.agentNamespace,
  );

  const handleSubmit: FormikConfig<NodePoolFormValues>['onSubmit'] = async (values) => {
    setError(undefined);
    const patches = getPatches(values, nodePool);

    try {
      await onSubmit(nodePool, patches);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
    }
  };

  return (
    <Modal
      aria-label="Manage hosts dialog"
      title={t('Manage hosts')}
      isOpen
      onClose={onClose}
      variant={ModalVariant.medium}
      hasNoBodyWrapper
    >
      <Formik<NodePoolFormValues>
        initialValues={{
          nodePoolName: nodePool.metadata?.name || '',
          agentLabels: labelsToFormikValue(
            nodePool.spec.platform?.agent?.agentLabelSelector?.matchLabels || {},
          ),
          count: nodePool.spec.replicas || 1,
          useAutoscaling: !!nodePool.spec.autoScaling,
          autoscaling: {
            minReplicas: nodePool.spec.autoScaling?.min || 1,
            maxReplicas: nodePool.spec.autoScaling?.max || 1,
          },
        }}
        isInitialValid={false}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid, submitForm }) => (
          <>
            <ModalBoxBody>
              <Stack hasGutter>
                <StackItem>
                  <NodePoolForm
                    agents={namespaceAgents}
                    agentMachines={agentMachines}
                    nodePool={nodePool}
                    hostedCluster={hostedCluster}
                    vmwareTemplate={vmwareTemplate}
                  />
                </StackItem>
                {vmwareTemplate && vmwareTemplate.status?.resourceUtilization && (
                  <StackItem>
                    <div style={{ padding: '16px', border: '1px solid #d2d2d2', borderRadius: '4px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                        {t('Available VMware Capacity')}
                      </div>
                      <Stack hasGutter>
                        <StackItem>
                          <div style={{ marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>{t('Storage')}</div>
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
                        </StackItem>
                        <StackItem>
                          <div style={{ marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>{t('CPU')}</div>
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
                        </StackItem>
                        <StackItem>
                          <div style={{ marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>{t('Memory')}</div>
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
                        </StackItem>
                        <StackItem>
                          <div style={{ fontSize: '13px', paddingTop: '4px' }}>
                            <span style={{ fontWeight: 500 }}>{t('Estimated VM Capacity')}:</span>{' '}
                            {vmwareTemplate.status.resourceUtilization.estimatedVMCapacity}
                            {vmwareTemplate.spec?.vmTemplate?.resourceLimits?.maxVMs !== undefined &&
                              ` / ${vmwareTemplate.spec.vmTemplate.resourceLimits.maxVMs} Max VMs`}
                          </div>
                        </StackItem>
                      </Stack>
                    </div>
                  </StackItem>
                )}
                {vmwareTemplate && !vmwareTemplate.status?.resourceUtilization && (
                  <StackItem>
                    <Alert variant="info" isInline title={t('VMware resource utilization data is not yet available. The VMware controller will populate this information shortly.')} />
                  </StackItem>
                )}
                {error && (
                  <StackItem>
                    <Alert variant="danger" title={error} isInline />
                  </StackItem>
                )}
              </Stack>
            </ModalBoxBody>
            <ModalBoxFooter>
              <Button
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={submitForm}
                isDisabled={!isValid || isSubmitting}
                icon={isSubmitting ? <Spinner size="md" /> : undefined}
              >
                {t('Update')}
              </Button>
              <Button variant="link" onClick={onClose}>
                {t('cancel')}
              </Button>
            </ModalBoxFooter>
          </>
        )}
      </Formik>
    </Modal>
  );
};

export default ManageHostsModal;
