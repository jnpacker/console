/* Copyright Contributors to the Open Cluster Management project */

import { useMemo, useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AcmDrawerContext } from '@open-cluster-management/ui-components'
import { BulkActionModel, errorIsNot, IBulkActionModelProps } from '../../../../components/BulkActionModel'
import { RbacDropdown } from '../../../../components/Rbac'
import { ManagedClusterSet, ManagedClusterSetDefinition } from '../../../../resources/managed-cluster-set'
import { deleteResource, ResourceErrorCode } from '../../../../lib/resource-request'
import { ClusterStatuses } from './ClusterStatuses'
import { rbacCreate, rbacPatch, rbacDelete } from '../../../../lib/rbac-util'
import { NavigationPath } from '../../../../NavigationPath'
import { EditLabels } from '../../Clusters/components/EditLabels'

export function ClusterSetActionDropdown(props: { managedClusterSet: ManagedClusterSet; isKebab?: boolean }) {
    const { t } = useTranslation(['cluster'])
    const history = useHistory()
    const { setDrawerContext } = useContext(AcmDrawerContext)
    const [modalProps, setModalProps] = useState<IBulkActionModelProps<ManagedClusterSet> | { open: false }>({
        open: false,
    })

    const modalColumns = useMemo(
        () => [
            {
                header: t('table.name'),
                cell: (managedClusterSet: ManagedClusterSet) => (
                    <span style={{ whiteSpace: 'nowrap' }}>{managedClusterSet.metadata.name}</span>
                ),
                sort: 'name',
            },
            {
                header: t('table.clusters'),
                sort: 'status',
                cell: (managedClusterSet: ManagedClusterSet) => (
                    <ClusterStatuses managedClusterSet={managedClusterSet} />
                ),
            },
        ],
        [t]
    )

    const actions = [
        {
            id: 'edit-labels',
            text: t('managed.editLabels'),
            click: (managedClusterSet: ManagedClusterSet) => {
                setDrawerContext({
                    isExpanded: true,
                    title: t('labels.edit.title'),
                    onCloseClick: () => setDrawerContext(undefined),
                    panelContent: <EditLabels resource={managedClusterSet} close={() => setDrawerContext(undefined)} />,
                    panelContentProps: { minSize: '600px' },
                })
            },
            isDisabled: true,
            rbac: [rbacPatch(props.managedClusterSet)],
        },
        {
            id: 'manage-clusterSet-resources',
            text: t('set.manage-resources'),
            click: (managedClusterSet: ManagedClusterSet) => {
                history.push(NavigationPath.clusterSetManage.replace(':id', managedClusterSet.metadata.name!))
            },
            isDisabled: true,
            rbac: [rbacCreate(ManagedClusterSetDefinition, undefined, props.managedClusterSet.metadata.name, 'join')],
        },
        {
            id: 'delete-clusterSet',
            text: t('set.delete'),
            click: (managedClusterSet: ManagedClusterSet) => {
                setModalProps({
                    open: true,
                    isDanger: true,
                    title: t('bulk.title.deleteSet'),
                    action: t('delete'),
                    processing: t('deleting'),
                    resources: [managedClusterSet],
                    description: t('bulk.message.deleteSet'),
                    columns: modalColumns,
                    keyFn: (managedClusterSet) => managedClusterSet.metadata.name! as string,
                    actionFn: deleteResource,
                    close: () => {
                        setModalProps({ open: false })
                    },
                    confirmText: managedClusterSet.metadata.name!,
                    isValidError: errorIsNot([ResourceErrorCode.NotFound]),
                })
            },
            isDisabled: true,
            rbac: [rbacDelete(ManagedClusterSetDefinition, undefined, props.managedClusterSet.metadata.name)],
        },
    ]

    return (
        <>
            <BulkActionModel<ManagedClusterSet> {...modalProps} />
            <RbacDropdown<ManagedClusterSet>
                id={`${props.managedClusterSet.metadata.name}-actions`}
                item={props.managedClusterSet}
                isKebab={props.isKebab}
                text={t('actions')}
                actions={actions}
            />
        </>
    )
}
