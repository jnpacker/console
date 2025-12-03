/* Copyright Contributors to the Open Cluster Management project */
import { useClusterDetailsContext } from '../../ClusterDetails/ClusterDetails'
import { ConfigMapK8sResource, getSupportedCM } from '@openshift-assisted/ui-lib/cim'
import ClusterInstallationProgress from './hypershift/ClusterInstallationProgress'
import { IResource } from '../../../../../../resources'
import { createResource, deleteResource, getResource, patchResource } from '../../../../../../resources/utils'
import { AcmExpandableCard } from '../../../../../../ui-components'
import { launchToOCP } from '../../../../../../lib/ocp-utils'
import { useSharedAtoms, useRecoilValue } from '../../../../../../shared-recoil'
import { VMwareResourceIndicators } from './vmware/VMwareResourceIndicators'
import { useMemo } from 'react'

const AIHypershiftClusterDetails: React.FC = () => {
  const { hostedCluster, agents } = useClusterDetailsContext()

  const { agentMachinesState, configMapsState, nodePoolsState, vmwareNodePoolTemplatesState } = useSharedAtoms()
  const nodePools = useRecoilValue(nodePoolsState)
  const agentMachines = useRecoilValue(agentMachinesState)
  const configMaps = useRecoilValue(configMapsState)
  const vmwareTemplates = useRecoilValue(vmwareNodePoolTemplatesState)

  const clusterNodePools = nodePools.filter(
    (np) =>
      np.metadata?.namespace === hostedCluster?.metadata?.namespace &&
      np.spec.clusterName === hostedCluster?.metadata?.name
  )

  const supportedVersionsCM = getSupportedCM(configMaps as ConfigMapK8sResource[])

  // Find VMware templates for the nodepools in this cluster
  const nodePoolVMwareTemplates = useMemo(() => {
    return clusterNodePools.map((np) => ({
      nodePool: np,
      vmwareTemplate: vmwareTemplates.find(
        (template) =>
          template.spec.nodePoolRef.name === np.metadata?.name &&
          template.metadata.namespace === hostedCluster?.metadata?.namespace
      ),
    }))
  }, [clusterNodePools, vmwareTemplates, hostedCluster?.metadata?.namespace])

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <AcmExpandableCard title="Cluster installation progress" id="aiprogress">
          <ClusterInstallationProgress
            agents={agents || []}
            agentMachines={agentMachines}
            hostedCluster={hostedCluster}
            fetchSecret={(name, namespace) =>
              getResource({ kind: 'Secret', apiVersion: 'v1', metadata: { name, namespace } }).promise
            }
            nodePools={clusterNodePools}
            onRemoveNodePool={(np) => deleteResource(np as IResource).promise}
            onUpdateNodePool={(nodePool, patches) => patchResource(nodePool as IResource, patches).promise}
            onAddNodePool={(nodePool) => createResource(nodePool as IResource).promise}
            launchToOCP={(url) => launchToOCP(url)}
            supportedVersionsCM={supportedVersionsCM}
          />

          {/* Show VMware resource indicators for each nodepool that has a VMwareNodePoolTemplate */}
          {nodePoolVMwareTemplates.map(
            ({ nodePool, vmwareTemplate }) =>
              vmwareTemplate && (
                <div key={nodePool.metadata?.name} style={{ marginTop: '24px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                    Node Pool: {nodePool.metadata?.name}
                  </div>
                  <VMwareResourceIndicators vmwareTemplate={vmwareTemplate} />
                </div>
              )
          )}
        </AcmExpandableCard>
      </div>
    </>
  )
}

export default AIHypershiftClusterDetails
