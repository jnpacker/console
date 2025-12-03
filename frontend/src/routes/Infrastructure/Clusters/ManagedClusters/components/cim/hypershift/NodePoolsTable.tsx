/* Copyright Contributors to the Open Cluster Management project */
// Local copy with modified ManageHostsModal to remove Agent availability check
import * as React from 'react';
import { Button, Label, Popover, Stack, StackItem } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import classnames from 'classnames';

import {
  AgentK8sResource,
  ConfigMapK8sResource,
  AgentMachineK8sResource,
  HostedClusterK8sResource,
  NodePoolK8sResource,
  NodePoolPatches,
} from '@openshift-assisted/ui-lib/cim';
import { getNodepoolAgents, fileSize, getHostRowHardwareInfo } from './utils';
import { useTranslation } from '../../../../../../../lib/acm-i18next';
import ManageHostsModal from '../../hypershift/ManageHostsModal';

// Inline simple components to avoid import restrictions
const INFRAENV_AGENTINSTALL_LABEL_KEY = 'infraenvs.agent-install.openshift.io';

const AgentStatus: React.FC<{ agent: AgentK8sResource; isDay2?: boolean }> = ({ agent }) => {
  const status = agent.status?.debugInfo?.state || 'unknown';
  return <span>{status}</span>;
};

const NodePoolStatus: React.FC<{ nodePool: NodePoolK8sResource; agents: AgentK8sResource[] }> = ({ nodePool, agents }) => {
  const isReady = nodePool.status?.conditions?.find(({ type }) => type === 'Ready')?.status === 'True';
  return <span>{isReady ? 'Ready' : 'Pending'}</span>;
};

const AddNodePoolModal: React.FC<any> = () => null; // Simplified - not used in this view
const RemoveNodePoolModal: React.FC<any> = () => null; // Simplified - not used in this view

type NodePoolsTableProps = {
  nodePools: NodePoolK8sResource[];
  agents: AgentK8sResource[];
  onRemoveNodePool: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  onUpdateNodePool: (
    nodePool: NodePoolK8sResource,
    nodePoolPatches: NodePoolPatches,
  ) => Promise<unknown>;
  hostedCluster: HostedClusterK8sResource;
  onAddNodePool: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  agentMachines: AgentMachineK8sResource[];
  supportedVersionsCM?: ConfigMapK8sResource;
  vmwareTemplates?: any[]; // VMwareNodePoolTemplate[]
};

const NodePoolsTable = ({
  nodePools,
  agents,
  onRemoveNodePool,
  onUpdateNodePool,
  hostedCluster,
  onAddNodePool,
  agentMachines,
  supportedVersionsCM,
  vmwareTemplates = [],
}: NodePoolsTableProps): JSX.Element => {
  const { t } = useTranslation();
  const [manageHostsOpen, setManageHostsOpen] = React.useState<string>();
  const [addNodePool, setAddNodePool] = React.useState(false);
  const [removeNodePoolOpen, setRemoveNodePoolOpen] = React.useState<string>();
  const [expandedNodePools, setExpandedNodePools] = React.useState<string[]>([]);

  const manageNodePool = nodePools.find((np) => np.metadata?.uid === manageHostsOpen);
  const removeNodePool = nodePools.find((np) => np.metadata?.uid === removeNodePoolOpen);

  // Find the VMware template for the nodepool being managed
  const manageVmwareTemplate = manageNodePool ? vmwareTemplates.find(
    (template) =>
      template.spec?.nodePoolRef?.name === manageNodePool.metadata?.name &&
      template.metadata?.namespace === hostedCluster.metadata?.namespace
  ) : undefined;

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <Table variant="compact">
            <Thead>
              <Tr>
                <Th />
                <Th>{t('Nodepool')}</Th>
                <Th>{t('Hostname')}</Th>
                <Th>{t('Status')}</Th>
                <Th>{t('Infrastructure env')}</Th>
                <Th>{t('CPU cores')}</Th>
                <Th>{t('Memory')}</Th>
                <Th>{t('Total storage')}</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {...nodePools.reduce<JSX.Element[]>((rows, np) => {
                const nodePoolAgents = getNodepoolAgents(np, agents, agentMachines, hostedCluster);
                const isExpanded = expandedNodePools.some((uid) => uid === np.metadata?.uid);

                const totals = nodePoolAgents.reduce(
                  (acc, agent) => {
                    const { memory, cores, disk } = getHostRowHardwareInfo(
                      agent.status?.inventory || {},
                    );
                    acc.memory += +memory.sortableValue;
                    acc.cores += +cores.sortableValue;
                    acc.disk += +disk.sortableValue;
                    return acc;
                  },
                  { memory: 0, cores: 0, disk: 0 },
                );

                rows.push(
                  <Tr
                    key={np.metadata?.uid}
                    className={isExpanded ? 'ai-nodepools-table__no-border' : undefined}
                  >
                    <Td
                      expand={
                        nodePoolAgents.length
                          ? {
                              isExpanded,
                              rowIndex: 0,
                              onToggle: () =>
                                isExpanded
                                  ? setExpandedNodePools(
                                      expandedNodePools.filter((uid) => uid !== np.metadata?.uid),
                                    )
                                  : setExpandedNodePools([
                                      ...expandedNodePools,
                                      np.metadata?.uid || '',
                                    ]),
                            }
                          : undefined
                      }
                    />
                    <Td>{np.metadata?.name}</Td>
                    <Td>
                      <Popover
                        aria-label="node pool hosts"
                        hasAutoWidth
                        bodyContent={t('{{agents}} of {{count}} host requested is available', {
                          agents: nodePoolAgents.length,
                          count: np.spec.replicas,
                        })}
                      >
                        <Label variant="outline">
                          {t('{{count}} host requested', { count: np.spec.replicas })}
                        </Label>
                      </Popover>
                    </Td>
                    <Td>
                      <NodePoolStatus nodePool={np} agents={nodePoolAgents} />
                    </Td>
                    <Td>-</Td>
                    <Td>{nodePoolAgents.length ? totals.cores : '-'}</Td>
                    <Td>{nodePoolAgents.length ? fileSize(totals.memory, 2, 'iec') : '-'}</Td>
                    <Td>{nodePoolAgents.length ? fileSize(totals.disk, 2, 'si') : '-'}</Td>
                    <Td
                      actions={{
                        items: [
                          {
                            title: t('Manage hosts'),
                            onClick: () => setManageHostsOpen(np.metadata?.uid),
                          },
                          {
                            title: t('Remove Nodepool'),
                            onClick: () => setRemoveNodePoolOpen(np.metadata?.uid),
                          },
                        ],
                      }}
                    />
                  </Tr>,
                );
                if (expandedNodePools.find((uid) => uid === np.metadata?.uid)) {
                  nodePoolAgents.forEach((agent, index) => {
                    const { memory, cores, disk } = getHostRowHardwareInfo(
                      agent.status?.inventory || {},
                    );
                    rows.push(
                      <Tr
                        key={agent.metadata?.uid}
                        className={classnames({
                          'ai-nodepools-table__no-border': index < nodePoolAgents.length - 1,
                        })}
                      >
                        <Td />
                        <Td />
                        <Td>{agent.spec.hostname || agent.status?.inventory.hostname}</Td>
                        <Td>
                          <AgentStatus agent={agent} isDay2 />
                        </Td>
                        <Td>
                          {agent.metadata?.labels?.[INFRAENV_AGENTINSTALL_LABEL_KEY] || '-'}
                        </Td>
                        <Td>{cores.title}</Td>
                        <Td>{memory.title}</Td>
                        <Td>{disk.title}</Td>
                      </Tr>,
                    );
                  });
                }
                return rows;
              }, [])}
            </Tbody>
          </Table>
        </StackItem>
        <StackItem>
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            iconPosition="right"
            onClick={() => setAddNodePool(true)}
          >
            {t('Add Nodepool')}
          </Button>
        </StackItem>
      </Stack>
      {manageNodePool && (
        <ManageHostsModal
          hostedCluster={hostedCluster}
          agents={agents}
          nodePool={manageNodePool}
          onClose={() => setManageHostsOpen(undefined)}
          onSubmit={onUpdateNodePool}
          agentMachines={agentMachines}
          vmwareTemplate={manageVmwareTemplate}
        />
      )}
      {addNodePool && (
        <AddNodePoolModal
          onClose={() => setAddNodePool(false)}
          onSubmit={onAddNodePool}
          agentsNamespace={hostedCluster.spec.platform.agent?.agentNamespace || ''}
          agents={agents}
          hostedCluster={hostedCluster}
          supportedVersionsCM={supportedVersionsCM}
        />
      )}
      {removeNodePool && (
        <RemoveNodePoolModal
          onClose={() => setRemoveNodePoolOpen(undefined)}
          onRemove={onRemoveNodePool}
          nodePool={removeNodePool}
        />
      )}
    </>
  );
};

export default NodePoolsTable;
