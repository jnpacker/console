/* Copyright Contributors to the Open Cluster Management project */

import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { discoveredClusterState, discoveryConfigState, secretsState } from '../../../atoms'
import { mockCRHCredential, mockDiscoveryConfig } from '../../../lib/test-metadata'
import { waitForNotText, waitForText } from '../../../lib/test-util'
import { DiscoveredCluster } from '../../../resources/discovered-cluster'
import DiscoveredClustersPage from './DiscoveredClusters'

const mockDiscoveredClusters: DiscoveredCluster[] = [
    {
        apiVersion: 'discovery.open-cluster-management.io/v1',
        kind: 'DiscoveredCluster',
        metadata: { name: 'test-cluster-01', namespace: 'alpha' },
        spec: {
            activity_timestamp: '2020-07-30T19:09:43Z',
            cloudProvider: 'aws',
            console: 'https://console-openshift-console.apps.test-cluster-01.dev01.red-chesterfield.com',
            creation_timestamp: '2020-07-30T19:09:43Z',
            name: 'test-cluster-01',
            display_name: 'test-cluster-01',
            openshiftVersion: '4.5.5',
            credential: {
                apiVersion: 'v1',
                kind: 'Secret',
                name: 'ocm-api-token',
                namespace: 'open-cluster-management',
                resourceVersion: '2673462626',
                uid: '8e103e5d-0267-4872-b185-1240e413d7b4',
            },
            status: 'Active',
        },
    },
    {
        apiVersion: 'discovery.open-cluster-management.io/v1',
        kind: 'DiscoveredCluster',
        metadata: { name: 'test-cluster-02', namespace: 'discovered-cluster-namespace' },
        spec: {
            activity_timestamp: '2020-07-30T19:09:43Z',
            cloudProvider: 'gcp',
            display_name: 'test-cluster-02',
            console: 'https://console-openshift-console.apps.test-cluster-02.dev01.red-chesterfield.com',
            creation_timestamp: '2020-07-30T19:09:43Z',
            name: 'test-cluster-02',
            openshiftVersion: '4.6.1',
            status: 'Stale',
        },
    },
    {
        apiVersion: 'discovery.open-cluster-management.io/v1',
        kind: 'DiscoveredCluster',
        metadata: { name: 'test-cluster-03', namespace: 'discovered-cluster-namespace' },
        spec: {
            activity_timestamp: '2020-07-30T19:09:43Z',
            cloudProvider: 'openstack',
            isManagedCluster: true,
            display_name: 'test-cluster-03',
            console: 'https://console-openshift-console.apps.test-cluster-03.dev01.red-chesterfield.com',
            creation_timestamp: '2020-07-30T19:09:43Z',
            name: 'test-cluster-03',
            openshiftVersion: '4.6.1',
            status: 'Stale',
        },
    },
]

describe('DiscoveredClusters', () => {
    test('DiscoveredClusters Table', async () => {
        render(
            <RecoilRoot
                initializeState={(snapshot) => {
                    snapshot.set(discoveredClusterState, mockDiscoveredClusters)
                    snapshot.set(discoveryConfigState, [mockDiscoveryConfig])
                    snapshot.set(secretsState, [mockCRHCredential])
                }}
            >
                <MemoryRouter>
                    <DiscoveredClustersPage />
                </MemoryRouter>
            </RecoilRoot>
        )

        await waitForText(mockDiscoveredClusters[0].spec.display_name)
        await waitForText('OpenShift ' + mockDiscoveredClusters[0].spec.openshiftVersion)
        await waitForText(mockDiscoveredClusters[1].spec.display_name)
        await waitForText('OpenShift ' + mockDiscoveredClusters[1].spec.openshiftVersion)

        await waitForNotText(mockDiscoveredClusters[2].spec.display_name) // Ensure managedcluster does not appear

        await waitForText(mockDiscoveredClusters[0].metadata.namespace!)
    })

    test('No provider connections or discoveryconfig (Empty State 1)', async () => {
        render(
            <RecoilRoot
                initializeState={(snapshot) => {
                    snapshot.set(discoveredClusterState, [])
                    snapshot.set(discoveryConfigState, [])
                    snapshot.set(secretsState, [])
                }}
            >
                <MemoryRouter>
                    <DiscoveredClustersPage />
                </MemoryRouter>
            </RecoilRoot>
        )
        await waitForText('emptystate.defaultState.title')
        await waitForText('discovery:emptystate.defaultState.msg')
        await waitForText('emptystate.addCredential')
    })

    test('CRH credentials exist, but no discoveryconfig (Empty State 2)', async () => {
        render(
            <RecoilRoot
                initializeState={(snapshot) => {
                    snapshot.set(discoveredClusterState, [])
                    snapshot.set(discoveryConfigState, [])
                    snapshot.set(secretsState, [mockCRHCredential])
                }}
            >
                <MemoryRouter>
                    <DiscoveredClustersPage />
                </MemoryRouter>
            </RecoilRoot>
        )
        await waitForText('emptystate.credentials.title')
        await waitForText('discovery:emptystate.credentials.msg')
        await waitForText('emptystate.enableClusterDiscovery')
    })

    test('CRH and discoveryconfig exist, but no discoveredclusters (Empty State 3)', async () => {
        render(
            <RecoilRoot
                initializeState={(snapshot) => {
                    snapshot.set(discoveredClusterState, [])
                    snapshot.set(discoveryConfigState, [mockDiscoveryConfig])
                    snapshot.set(secretsState, [mockCRHCredential])
                }}
            >
                <MemoryRouter>
                    <DiscoveredClustersPage />
                </MemoryRouter>
            </RecoilRoot>
        )
        await waitForText('emptystate.discoveryEnabled.title')
        await waitForText('emptystate.discoveryEnabled.msg')
        await waitForText('emptystate.viewDocumentation')
    })
})
