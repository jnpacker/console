/* Copyright Contributors to the Open Cluster Management project */
import React from 'react';
import { useFormikContext } from 'formik';
import { Flex, FlexItem, Form, FormGroup } from '@patternfly/react-core';
import { AgentK8sResource, getAgentsForSelection } from '@openshift-assisted/ui-lib/cim';
import ClusterDeploymentHostsSelectionAdvanced from '@openshift-assisted/ui-lib/cim';
import { ScaleUpFormValues, AgentTableActions } from '@openshift-assisted/ui-lib/cim';
import { SwitchField, RadioField } from '@openshift-assisted/ui-lib/common';
import { useTranslation } from '../../../../../../../lib/acm-i18next';
import ClusterScaleUpAutoHostsSelection from './ClusterScaleUpAutoHostsSelection';

type ScaleUpFormProps = {
  agents: AgentK8sResource[];
  onEditHost: AgentTableActions['onEditHost'];
  onEditRole: AgentTableActions['onEditRole'];
  onSetInstallationDiskId: AgentTableActions['onSetInstallationDiskId'];
  isNutanix: boolean;
};

const ScaleUpForm: React.FC<ScaleUpFormProps> = ({
  agents,
  onEditHost,
  onEditRole,
  onSetInstallationDiskId,
  isNutanix,
}) => {
  const { values } = useFormikContext<ScaleUpFormValues>();
  const { autoSelectHosts } = values;
  const availableAgents = React.useMemo(
    () =>
      getAgentsForSelection(agents).filter(
        (agent) =>
          !(
            agent.spec?.clusterDeploymentName?.name || agent.spec?.clusterDeploymentName?.namespace
          ) &&
          (isNutanix
            ? agent.status?.inventory?.systemVendor?.manufacturer === 'Nutanix'
            : agent.status?.inventory?.cpu?.architecture === values.cpuArchitecture),
      ),
    [agents, values.cpuArchitecture, isNutanix],
  );
  const { t } = useTranslation();
  return (
    <Form>
      <SwitchField name="autoSelectHosts" label={t('Auto-select hosts')} />
      {!isNutanix && (
        <FormGroup fieldId="cpuArchitecture" label={t('CPU architecture')}>
          <Flex justifyContent={{ default: 'justifyContentFlexStart' }}>
            <FlexItem>
              <RadioField
                name="cpuArchitecture"
                id="x86_64"
                value="x86_64"
                label={t('x86_64')}
              />
            </FlexItem>
            <FlexItem>
              <RadioField
                name="cpuArchitecture"
                id="arm64"
                value="arm64"
                label={<>{t('arm64')}&nbsp;</>}
              />
            </FlexItem>
          </Flex>
        </FormGroup>
      )}

      {autoSelectHosts && <ClusterScaleUpAutoHostsSelection availableAgents={availableAgents} />}

      {!autoSelectHosts && (
        <ClusterDeploymentHostsSelectionAdvanced<ScaleUpFormValues>
          availableAgents={availableAgents}
          onEditHost={onEditHost}
          onEditRole={onEditRole}
          onSetInstallationDiskId={onSetInstallationDiskId}
        />
      )}
    </Form>
  );
};

export default ScaleUpForm;
