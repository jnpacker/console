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
