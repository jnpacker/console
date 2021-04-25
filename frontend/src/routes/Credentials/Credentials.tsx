/* Copyright Contributors to the Open Cluster Management project */

import {
    AcmButton,
    AcmEmptyState,
    AcmInlineProvider,
    AcmPage,
    AcmPageContent,
    AcmPageHeader,
    AcmRoute,
    AcmTable,
    compareStrings,
    Provider,
    ProviderLongTextMap,
} from '@open-cluster-management/ui-components'
import { Card, CardBody, PageSection } from '@patternfly/react-core'
import { fitContent, TableGridBreakpoint } from '@patternfly/react-table'
import { Fragment, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link, useHistory } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { acmRouteState, discoveryConfigState, secretsState } from '../../atoms'
import { BulkActionModel, IBulkActionModelProps } from '../../components/BulkActionModel'
import { RbacDropdown } from '../../components/Rbac'
import { rbacDelete, rbacPatch } from '../../lib/rbac-util'
import { deleteResource } from '../../lib/resource-request'
import { NavigationPath } from '../../NavigationPath'
import { DiscoveryConfig } from '../../resources/discovery-config'
import { ProviderConnection, unpackProviderConnection } from '../../resources/provider-connection'
import { Secret } from '../../resources/secret'
import moment from 'moment'

export default function CredentialsPage() {
    const { t } = useTranslation(['connection'])
    const [secrets] = useRecoilState(secretsState)
    const providerConnections = secrets.map(unpackProviderConnection)
    const [discoveryConfigs] = useRecoilState(discoveryConfigState)
    const [, setRoute] = useRecoilState(acmRouteState)
    useEffect(() => setRoute(AcmRoute.Credentials), [setRoute])
    return (
        <AcmPage>
            <AcmPageHeader title={t('connections')} />
            <AcmPageContent id="credentials">
                <PageSection>
                    <Card>
                        <CardBody>
                            <CredentialsTable
                                providerConnections={providerConnections}
                                discoveryConfigs={discoveryConfigs}
                                secrets={secrets}
                            />
                        </CardBody>
                    </Card>
                </PageSection>
            </AcmPageContent>
        </AcmPage>
    )
}

// Ingoring coverage since this will move one the console header navigation is done
/* istanbul ignore next */
const AddConnectionBtn = () => {
    const { t } = useTranslation(['connection'])
    return (
        <AcmButton component={Link} to={NavigationPath.addCredentials}>
            {t('add')}
        </AcmButton>
    )
}

function getProviderName(labels: Record<string, string> | undefined) {
    const label = labels?.['cluster.open-cluster-management.io/provider']
    if (label) {
        const providerName = (ProviderLongTextMap as Record<string, string>)[label]
        if (providerName) return providerName
    }
    return 'unknown'
}

export function CredentialsTable(props: {
    providerConnections?: ProviderConnection[]
    discoveryConfigs?: DiscoveryConfig[]
    secrets?: Secret[]
}) {
    const { t } = useTranslation(['connection', 'common'])
    const history = useHistory()
    const [modalProps, setModalProps] = useState<IBulkActionModelProps<Secret> | { open: false }>({
        open: false,
    })

    function getAdditionalActions(item: Secret) {
        const label = item.metadata.labels?.['cluster.open-cluster-management.io/provider']
        if (label === Provider.redhatcloud && !CredentialIsInUseByDiscovery(item)) {
            return t('connections.actions.enableClusterDiscovery')
        } else {
            return t('connections.actions.editClusterDiscovery')
        }
    }

    function CredentialIsInUseByDiscovery(credential: Secret) {
        let inUse = false
        if (props.discoveryConfigs) {
            props.discoveryConfigs.forEach((discoveryConfig) => {
                if (
                    discoveryConfig.metadata &&
                    discoveryConfig.spec.credential !== '' &&
                    credential.metadata &&
                    discoveryConfig.metadata.namespace === credential.metadata.namespace
                ) {
                    inUse = true
                    return
                }
            })
        }
        return inUse
    }

    return (
        <Fragment>
            <BulkActionModel<Secret> {...modalProps} />
            <AcmTable<Secret>
                gridBreakPoint={TableGridBreakpoint.none}
                emptyState={
                    <AcmEmptyState
                        title={t('empty.title')}
                        message={<Trans i18nKey={'connection:empty.subtitle'} components={{ bold: <strong /> }} />}
                        action={<AddConnectionBtn />}
                    />
                }
                plural={t('connections')}
                items={props.secrets}
                columns={[
                    {
                        header: t('table.header.name'),
                        sort: 'metadata.name',
                        search: 'metadata.name',
                        cell: (secret) => (
                            <span style={{ whiteSpace: 'nowrap' }}>
                                <Link
                                    to={NavigationPath.viewCredentials
                                        .replace(':namespace', secret.metadata.namespace as string)
                                        .replace(':name', secret.metadata.name as string)}
                                >
                                    {secret.metadata.name}
                                </Link>
                            </span>
                        ),
                    },
                    {
                        header: t('table.header.provider'),
                        sort: /* istanbul ignore next */ (a: Secret, b: Secret) => {
                            return compareStrings(
                                getProviderName(a.metadata?.labels),
                                getProviderName(b.metadata?.labels)
                            )
                        },
                        cell: (item: Secret) => {
                            const provider = item.metadata.labels?.['cluster.open-cluster-management.io/provider']
                            if (provider) return <AcmInlineProvider provider={provider as Provider} />
                            else return <Fragment />
                        },
                        search: (item: Secret) => {
                            return getProviderName(item.metadata?.labels)
                        },
                    },
                    {
                        header: t('table.header.namespace'),
                        sort: 'metadata.namespace',
                        search: 'metadata.namespace',
                        cell: 'metadata.namespace',
                    },
                    {
                        header: t('table.header.additionalActions'),
                        search: (item: Secret) => {
                            return getAdditionalActions(item)
                        },
                        cell: (item: Secret) => {
                            const label = item.metadata.labels?.['cluster.open-cluster-management.io/provider']
                            if (label === Provider.redhatcloud) {
                                if (CredentialIsInUseByDiscovery(item)) {
                                    return (
                                        <Link
                                            to={NavigationPath.editDiscoveryConfig
                                                .replace(':namespace', item.metadata.namespace as string)
                                                .replace(':name', 'discovery')}
                                        >
                                            {t('connections.actions.editClusterDiscovery')}
                                        </Link>
                                    )
                                } else {
                                    return (
                                        <Link to={NavigationPath.addDiscoveryConfig}>
                                            {t('connections.actions.enableClusterDiscovery')}
                                        </Link>
                                    )
                                }
                            } else {
                                return <span>-</span>
                            }
                        },
                        sort: /* istanbul ignore next */ (a: Secret, b: Secret) => {
                            return compareStrings(getAdditionalActions(a), getAdditionalActions(b))
                        },
                    },
                    {
                        header: 'Created',
                        sort: 'metadata.creationTimestamp',
                        cell: (resource) => (
                            <span style={{ whiteSpace: 'nowrap' }}>
                                {resource.metadata.creationTimestamp &&
                                    moment(new Date(resource.metadata.creationTimestamp)).fromNow()}
                            </span>
                        ),
                    },
                    {
                        header: '',
                        cellTransforms: [fitContent],
                        cell: (secret: Secret) => {
                            const actions = [
                                {
                                    id: 'editConnection',
                                    text: t('edit'),
                                    isDisabled: true,
                                    click: (secret: Secret) => {
                                        history.push(
                                            NavigationPath.editCredentials
                                                .replace(':namespace', secret.metadata.namespace!)
                                                .replace(':name', secret.metadata.name!)
                                        )
                                    },
                                    rbac: [rbacPatch(secret)], // validate that this is working
                                },
                                {
                                    id: 'deleteConnection',
                                    text: t('delete'),
                                    isDisabled: true,
                                    click: (secret: Secret) => {
                                        setModalProps({
                                            open: true,
                                            title: t('bulk.title.delete'),
                                            action: t('common:delete'),
                                            processing: t('common:deleting'),
                                            resources: [secret],
                                            description: t('bulk.message.delete'),
                                            columns: [
                                                {
                                                    header: t('table.header.name'),
                                                    cell: 'metadata.name',
                                                    sort: 'metadata.name',
                                                },
                                                {
                                                    header: t('table.header.namespace'),
                                                    cell: 'metadata.namespace',
                                                    sort: 'metadata.namespace',
                                                },
                                            ],
                                            keyFn: (secret: Secret) => secret.metadata.uid as string,
                                            actionFn: deleteResource,
                                            close: () => setModalProps({ open: false }),
                                            isDanger: true,
                                        })
                                    },
                                    rbac: [rbacDelete(secret)],
                                },
                            ]

                            return (
                                <RbacDropdown<Secret>
                                    id={`${secret.metadata.name}-actions`}
                                    item={secret}
                                    isKebab={true}
                                    text={`${secret.metadata.name}-actions`}
                                    actions={actions}
                                />
                            )
                        },
                    },
                ]}
                keyFn={(secret) => secret.metadata?.uid as string}
                tableActions={[
                    {
                        id: 'add',
                        title: t('add'),
                        click: () => {
                            history.push(NavigationPath.addCredentials)
                        },
                    },
                ]}
                bulkActions={[
                    {
                        id: 'deleteConnection',
                        title: t('delete.batch'),
                        click: (secrets: Secret[]) => {
                            setModalProps({
                                open: true,
                                title: t('bulk.title.delete'),
                                action: t('common:delete'),
                                processing: t('common:deleting'),
                                resources: [...secrets],
                                description: t('bulk.message.delete'),
                                columns: [
                                    {
                                        header: t('table.header.name'),
                                        cell: 'metadata.name',
                                        sort: 'metadata.name',
                                    },
                                    {
                                        header: t('table.header.namespace'),
                                        cell: 'metadata.namespace',
                                        sort: 'metadata.namespace',
                                    },
                                ],
                                keyFn: (secret: Secret) => secret.metadata.uid as string,
                                actionFn: deleteResource,
                                close: () => setModalProps({ open: false }),
                                isDanger: true,
                            })
                        },
                    },
                ]}
                rowActions={[]}
            />
        </Fragment>
    )
}
