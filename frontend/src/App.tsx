/* Copyright Contributors to the Open Cluster Management project */
/* istanbul ignore file */

import { AcmHeader, AcmTablePaginationContextProvider } from '@open-cluster-management/ui-components'
import { Suspense, lazy } from 'react'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import { useRecoilState } from 'recoil'
import { acmRouteState, LoadData } from './atoms'
import './lib/i18n'
import { NavigationPath } from './NavigationPath'
import { LoadingPage } from './components/LoadingPage'
import './App.css'

const ClusterManagementPage = lazy(() => import('./routes/ClusterManagement/ClusterManagement'))
const ClusterDetailsPage = lazy(() => import('./routes/ClusterManagement/Clusters/ClusterDetails/ClusterDetails'))
const ClusterSetDetailsPage = lazy(
    () => import('./routes/ClusterManagement/ClusterSets/ClusterSetDetails/ClusterSetDetails')
)
const CreateClusterPoolPage = lazy(
    () => import('./routes/ClusterManagement/ClusterPools/CreateClusterPool/CreateClusterPool')
)
const CreateClusterPage = lazy(() => import('./routes/ClusterManagement/Clusters/CreateCluster/CreateCluster'))
const ImportClusterPage = lazy(() => import('./routes/ClusterManagement/Clusters/ImportCluster/ImportCluster'))
const CreateBareMetalAssetPage = lazy(() => import('./routes/BareMetalAssets/CreateBareMetalAsset'))
const DiscoveryConfig = lazy(() => import('./routes/Discovery/DiscoveryConfig/DiscoveryConfig'))
const CredentialPage = lazy(() => import('./routes/Credentials/CredentialsForm'))
const CredentialsPage = lazy(() => import('./routes/Credentials/Credentials'))
const AnsibleAutomationFormPage = lazy(
    () => import('./routes/ClusterManagement/AnsibleAutomations/AnsibleAutomationsForm')
)
export default function App() {
    const [route] = useRecoilState(acmRouteState)
    return (
        <BrowserRouter>
            <AcmHeader route={route}>
                <LoadData>
                    <AcmTablePaginationContextProvider localStorageKey="clusters">
                        <Suspense fallback={<LoadingPage />}>
                            <Switch>
                                <Route path={NavigationPath.clusterDetails} component={ClusterDetailsPage} />
                                <Route path={NavigationPath.clusterSetDetails} component={ClusterSetDetailsPage} />
                                <Route
                                    exact
                                    path={NavigationPath.createClusterPool}
                                    component={CreateClusterPoolPage}
                                />
                                <Route exact path={NavigationPath.createCluster} component={CreateClusterPage} />
                                <Route exact path={NavigationPath.importCluster} component={ImportClusterPage} />
                                <Route exact path={NavigationPath.credentials} component={CredentialsPage} />
                                <Route exact path={NavigationPath.addCredentials} component={CredentialPage} />
                                <Route exact path={NavigationPath.editCredentials} component={CredentialPage} />
                                <Route exact path={NavigationPath.viewCredentials} component={CredentialPage} />
                                <Route
                                    exact
                                    path={NavigationPath.addAnsibleAutomation}
                                    component={AnsibleAutomationFormPage}
                                />
                                <Route
                                    exact
                                    path={NavigationPath.editAnsibleAutomation}
                                    component={AnsibleAutomationFormPage}
                                />
                                <Route
                                    exact
                                    path={NavigationPath.editBareMetalAsset}
                                    component={CreateBareMetalAssetPage}
                                />
                                <Route
                                    exact
                                    path={NavigationPath.createBareMetalAsset}
                                    component={CreateBareMetalAssetPage}
                                />
                                <Route exact path={NavigationPath.createDiscovery} component={DiscoveryConfig} />
                                <Route exact path={NavigationPath.configureDiscovery} component={DiscoveryConfig} />
                                <Route path={NavigationPath.console} component={ClusterManagementPage} />
                                <Route exact path="*">
                                    <Redirect to={NavigationPath.console} />
                                </Route>
                            </Switch>
                        </Suspense>
                    </AcmTablePaginationContextProvider>
                </LoadData>
            </AcmHeader>
        </BrowserRouter>
    )
}
