/* Copyright Contributors to the Open Cluster Management project */

import { render } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
import { namespacesState } from '../../atoms'
import { nockCreate, nockIgnoreRBAC } from '../../lib/nock-util'
import { clickByTestId, clickByText, selectByText, typeByTestId, waitForNock } from '../../lib/test-util'
import { NavigationPath } from '../../NavigationPath'
import { Namespace, NamespaceApiVersion, NamespaceKind } from '../../resources/namespace'
import {
    packProviderConnection,
    ProviderConnection,
    ProviderConnectionApiVersion,
    ProviderConnectionKind,
    ProviderConnectionSpec,
} from '../../resources/provider-connection'
import AddCredentialPage2 from './CredentialsForm'

const mockNamespaces: Namespace[] = ['namespace1', 'namespace2', 'namespace3'].map((name) => ({
    apiVersion: NamespaceApiVersion,
    kind: NamespaceKind,
    metadata: { name },
}))

function AddCredentialsTest() {
    return (
        <RecoilRoot initializeState={(snapshot) => snapshot.set(namespacesState, mockNamespaces)}>
            <MemoryRouter initialEntries={[NavigationPath.addCredentials]}>
                <Route component={(props: any) => <AddCredentialPage2 {...props} />} />
            </MemoryRouter>
        </RecoilRoot>
    )
}

function createProviderConnection(provider: string, spec: ProviderConnectionSpec, common = false): ProviderConnection {
    return {
        apiVersion: ProviderConnectionApiVersion,
        kind: ProviderConnectionKind,
        type: 'Opaque',
        metadata: {
            name: `${provider}-connection`,
            namespace: mockNamespaces[0].metadata.name,
            labels: {
                'cluster.open-cluster-management.io/provider': provider,
                'cluster.open-cluster-management.io/cloudconnection': '',
            },
        },
        spec: common
            ? {
                  ...spec,
                  ...{
                      baseDomain: 'baseDomain',
                      pullSecret: '{"pull":"secret"}',
                      sshPrivatekey: '-----BEGIN OPENSSH PRIVATE KEY-----\nkey\n-----END OPENSSH PRIVATE KEY-----',
                      sshPublickey: 'ssh-rsa AAAAB1 fakeemail@redhat.com',
                  },
              }
            : spec,
    }
}

describe('add credentials page', () => {
    beforeEach(() => nockIgnoreRBAC())

    it('should create aws credentials', async () => {
        render(<AddCredentialsTest />)

        const providerConnection = createProviderConnection(
            'aws',
            { awsAccessKeyID: 'awsAccessKeyID', awsSecretAccessKeyID: 'awsSecretAccessKeyID' },
            true
        )

        // Credentials type
        await clickByTestId('aws')
        await clickByText('Next')

        // Credential details
        await typeByTestId('credentialsName', providerConnection.metadata.name!)
        await selectByText('addConnection.namespaceName.placeholder', providerConnection.metadata.namespace!)
        await clickByText('Next')

        // AWS credentials
        await typeByTestId('awsAccessKeyID', providerConnection.spec?.awsAccessKeyID!)
        await typeByTestId('awsSecretAccessKeyID', providerConnection.spec?.awsSecretAccessKeyID!)
        await clickByText('Next')

        // Base domain
        await typeByTestId('baseDomain', providerConnection.spec?.baseDomain!)
        await clickByText('Next')

        // Pull secret
        await typeByTestId('pullSecret', providerConnection.spec?.pullSecret!)
        await clickByText('Next')

        // SSH key
        await typeByTestId('sshPrivatekey', providerConnection.spec?.sshPrivatekey!)
        await typeByTestId('sshPublickey', providerConnection.spec?.sshPublickey!)
        await clickByText('Next')

        // Add Credentials
        const createNock = nockCreate(packProviderConnection({ ...providerConnection }))
        await clickByText('Add')
        await waitForNock(createNock)
    })

    it('should create azr credentials', async () => {
        render(<AddCredentialsTest />)

        const providerConnection = createProviderConnection(
            'azr',
            {
                baseDomainResourceGroupName: 'baseDomainResourceGroupName',
                clientId: 'clientId',
                clientSecret: 'clientSecret',
                tenantId: 'tenantId',
                subscriptionId: 'subscriptionId',
            },
            true
        )

        // Credentials type
        await clickByTestId('azr')
        await clickByText('Next')

        // Credential details
        await typeByTestId('credentialsName', providerConnection.metadata.name!)
        await selectByText('addConnection.namespaceName.placeholder', providerConnection.metadata.namespace!)
        await clickByText('Next')

        // AZR credentials
        await typeByTestId('baseDomainResourceGroupName', providerConnection.spec?.baseDomainResourceGroupName!)
        await typeByTestId('clientId', providerConnection.spec?.clientId!)
        await typeByTestId('clientSecret', providerConnection.spec?.clientSecret!)
        await typeByTestId('tenantId', providerConnection.spec?.tenantId!)
        await typeByTestId('subscriptionId', providerConnection.spec?.subscriptionId!)
        await clickByText('Next')

        // Base domain
        await typeByTestId('baseDomain', providerConnection.spec?.baseDomain!)
        await clickByText('Next')

        // Pull secret
        await typeByTestId('pullSecret', providerConnection.spec?.pullSecret!)
        await clickByText('Next')

        // SSH key
        await typeByTestId('sshPrivatekey', providerConnection.spec?.sshPrivatekey!)
        await typeByTestId('sshPublickey', providerConnection.spec?.sshPublickey!)
        await clickByText('Next')

        // Add Credentials
        const createNock = nockCreate(packProviderConnection({ ...providerConnection }))
        await clickByText('Add')
        await waitForNock(createNock)
    })

    it('should create gcp credentials', async () => {
        render(<AddCredentialsTest />)

        const providerConnection = createProviderConnection(
            'gcp',
            {
                gcProjectID: 'gcp123',
                gcServiceAccountKey: '{ "json": "key"}',
            },
            true
        )

        // Credentials type
        await clickByTestId('gcp')
        await clickByText('Next')

        // Credential details
        await typeByTestId('credentialsName', providerConnection.metadata.name!)
        await selectByText('addConnection.namespaceName.placeholder', providerConnection.metadata.namespace!)
        await clickByText('Next')

        // GCP credentials
        await typeByTestId('gcProjectID', providerConnection.spec?.gcProjectID!)
        await typeByTestId('gcServiceAccountKey', providerConnection.spec?.gcServiceAccountKey!)
        await clickByText('Next')

        // Base domain
        await typeByTestId('baseDomain', providerConnection.spec?.baseDomain!)
        await clickByText('Next')

        // Pull secret
        await typeByTestId('pullSecret', providerConnection.spec?.pullSecret!)
        await clickByText('Next')

        // SSH key
        await typeByTestId('sshPrivatekey', providerConnection.spec?.sshPrivatekey!)
        await typeByTestId('sshPublickey', providerConnection.spec?.sshPublickey!)
        await clickByText('Next')

        // Add Credentials
        const createNock = nockCreate(packProviderConnection({ ...providerConnection }))
        await clickByText('Add')
        await waitForNock(createNock)
    })

    it('should create vmw credentials', async () => {
        render(<AddCredentialsTest />)

        const providerConnection = createProviderConnection(
            'vmw',
            {
                vcenter: 'vcenter',
                username: 'username',
                password: 'password',
                cacertificate: '-----BEGIN CERTIFICATE-----\ncertdata\n-----END CERTIFICATE-----',
                vmClusterName: 'vmClusterName',
                datacenter: 'datacenter',
                datastore: 'datastore',
            },
            true
        )

        // Credentials type
        await clickByTestId('vmw')
        await clickByText('Next')

        // Credential details
        await typeByTestId('credentialsName', providerConnection.metadata.name!)
        await selectByText('addConnection.namespaceName.placeholder', providerConnection.metadata.namespace!)
        await clickByText('Next')

        // vCenter credentials
        await typeByTestId('vcenter', providerConnection.spec?.vcenter!)
        await typeByTestId('username', providerConnection.spec?.username!)
        await typeByTestId('password', providerConnection.spec?.password!)
        await typeByTestId('cacertificate', providerConnection.spec?.cacertificate!)
        await clickByText('Next')

        // vSphere credentials
        await typeByTestId('vmClusterName', providerConnection.spec?.vmClusterName!)
        await typeByTestId('datacenter', providerConnection.spec?.datacenter!)
        await typeByTestId('datastore', providerConnection.spec?.datastore!)
        await clickByText('Next')

        // Base domain
        await typeByTestId('baseDomain', providerConnection.spec?.baseDomain!)
        await clickByText('Next')

        // Pull secret
        await typeByTestId('pullSecret', providerConnection.spec?.pullSecret!)
        await clickByText('Next')

        // SSH key
        await typeByTestId('sshPrivatekey', providerConnection.spec?.sshPrivatekey!)
        await typeByTestId('sshPublickey', providerConnection.spec?.sshPublickey!)
        await clickByText('Next')

        // Add Credentials
        const createNock = nockCreate(packProviderConnection({ ...providerConnection }))
        await clickByText('Add')
        await waitForNock(createNock)
    })

    it('should create ost credentials', async () => {
        render(<AddCredentialsTest />)

        const providerConnection = createProviderConnection(
            'ost',
            {
                openstackCloudsYaml: 'openstackCloudsYaml',
                openstackCloud: 'openstackCloud',
            },
            true
        )

        // Credentials type
        await clickByTestId('ost')
        await clickByText('Next')

        // Credential details
        await typeByTestId('credentialsName', providerConnection.metadata.name!)
        await selectByText('addConnection.namespaceName.placeholder', providerConnection.metadata.namespace!)
        await clickByText('Next')

        // ost credentials
        await typeByTestId('openstackCloudsYaml', providerConnection.spec?.openstackCloudsYaml!)
        await typeByTestId('openstackCloud', providerConnection.spec?.openstackCloud!)
        await clickByText('Next')

        // Base domain
        await typeByTestId('baseDomain', providerConnection.spec?.baseDomain!)
        await clickByText('Next')

        // Pull secret
        await typeByTestId('pullSecret', providerConnection.spec?.pullSecret!)
        await clickByText('Next')

        // SSH key
        await typeByTestId('sshPrivatekey', providerConnection.spec?.sshPrivatekey!)
        await typeByTestId('sshPublickey', providerConnection.spec?.sshPublickey!)
        await clickByText('Next')

        // Add Credentials
        const createNock = nockCreate(packProviderConnection({ ...providerConnection }))
        await clickByText('Add')
        await waitForNock(createNock)
    })

    it('should create bmc credentials', async () => {
        render(<AddCredentialsTest />)

        const providerConnection = createProviderConnection(
            'bmc',
            {
                libvirtURI: 'qemu+ssh://libvirtURI',
                sshKnownHosts: ['sshKnownHosts'],
                imageMirror: 'image.mirror:123/abc',
                bootstrapOSImage: 'bootstrapOSImage',
                clusterOSImage: 'clusterOSImage',
                additionalTrustBundle: '-----BEGIN CERTIFICATE-----\ncertdata\n-----END CERTIFICATE-----',
            },
            true
        )

        // Credentials type
        await clickByTestId('bmc')
        await clickByText('Next')

        // Credential details
        await typeByTestId('credentialsName', providerConnection.metadata.name!)
        await selectByText('addConnection.namespaceName.placeholder', providerConnection.metadata.namespace!)
        await clickByText('Next')

        // bmc credentials
        await typeByTestId('libvirtURI', providerConnection.spec?.libvirtURI!)
        await typeByTestId('sshKnownHosts', providerConnection.spec?.sshKnownHosts?.[0]!)
        await clickByText('Next')

        // bmc disconnected
        await typeByTestId('imageMirror', providerConnection.spec?.imageMirror!)
        await typeByTestId('bootstrapOSImage', providerConnection.spec?.bootstrapOSImage!)
        await typeByTestId('clusterOSImage', providerConnection.spec?.clusterOSImage!)
        await typeByTestId('additionalTrustBundle', providerConnection.spec?.additionalTrustBundle!)
        await clickByText('Next')

        // Base domain
        await typeByTestId('baseDomain', providerConnection.spec?.baseDomain!)
        await clickByText('Next')

        // Pull secret
        await typeByTestId('pullSecret', providerConnection.spec?.pullSecret!)
        await clickByText('Next')

        // SSH key
        await typeByTestId('sshPrivatekey', providerConnection.spec?.sshPrivatekey!)
        await typeByTestId('sshPublickey', providerConnection.spec?.sshPublickey!)
        await clickByText('Next')

        // Add Credentials
        const createNock = nockCreate(packProviderConnection({ ...providerConnection }))
        await clickByText('Add')
        await waitForNock(createNock)
    })

    it('should create ans credentials', async () => {
        render(<AddCredentialsTest />)

        const providerConnection = createProviderConnection('ans', {
            ansibleHost: 'ansibleHost',
            ansibleToken: 'ansibleToken',
        })

        // Credentials type
        await clickByTestId('ans')
        await clickByText('Next')

        // Credential details
        await typeByTestId('credentialsName', providerConnection.metadata.name!)
        await selectByText('addConnection.namespaceName.placeholder', providerConnection.metadata.namespace!)
        await clickByText('Next')

        // ans credentials
        await typeByTestId('ansibleHost', providerConnection.spec?.ansibleHost!)
        await typeByTestId('ansibleToken', providerConnection.spec?.ansibleToken!)
        await clickByText('Next')

        // Add Credentials
        const createNock = nockCreate(packProviderConnection({ ...providerConnection }))
        await clickByText('Add')
        await waitForNock(createNock)
    })

    it('should create rhocm credentials', async () => {
        render(<AddCredentialsTest />)

        const providerConnection = createProviderConnection('rhocm', {
            ocmAPIToken: 'ocmAPIToken',
        })

        // Credentials type
        await clickByTestId('rhocm')
        await clickByText('Next')

        // Credential details
        await typeByTestId('credentialsName', providerConnection.metadata.name!)
        await selectByText('addConnection.namespaceName.placeholder', providerConnection.metadata.namespace!)
        await clickByText('Next')

        // rhocm credentials
        await typeByTestId('ocmAPIToken', providerConnection.spec?.ocmAPIToken!)
        await clickByText('Next')

        // Add Credentials
        const createNock = nockCreate(packProviderConnection({ ...providerConnection }))
        await clickByText('Add')
        await waitForNock(createNock)
    })
})