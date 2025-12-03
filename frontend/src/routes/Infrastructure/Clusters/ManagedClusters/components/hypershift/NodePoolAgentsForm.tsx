/* Copyright Contributors to the Open Cluster Management project */
import { Grid, GridItem } from '@patternfly/react-core';
import * as React from 'react';
import { CheckboxField, NumberInputField, PopoverIcon } from '@openshift-assisted/ui-lib/common';
import { AgentK8sResource } from '@openshift-assisted/ui-lib/cim';
import { useField } from 'formik';
import { useTranslation } from '../../../../../../lib/acm-i18next';

type NodePoolAgentsFormProps = {
  agents: AgentK8sResource[];
  labelName: string;
  countName: string;
  maxAgents: number;
  isEdit?: boolean;
  autoscalingName: string;
  useAutoscalingName: string;
  vmwareTemplate?: any; // VMwareNodePoolTemplate
  currentReplicas?: number;
};

const NodePoolAgentsForm = ({
  agents,
  labelName,
  countName,
  autoscalingName,
  maxAgents,
  useAutoscalingName,
  isEdit = false,
  vmwareTemplate,
  currentReplicas = 0,
}: NodePoolAgentsFormProps) => {
  const { t } = useTranslation();

  const [{ value: minValue }] = useField<number>(`${autoscalingName}.minReplicas`);
  const [{ value: maxValue }] = useField<number>(`${autoscalingName}.maxReplicas`);
  const [{ value: useAutoscalingValue }] = useField<boolean>(useAutoscalingName);
  const [{ value: countValue }] = useField<number>(countName);

  // Calculate available VMs from VMware template
  const vmwareCapacity = vmwareTemplate?.status?.resourceUtilization?.estimatedVMCapacity || 0;
  const additionalHosts = isEdit ? (countValue || 0) - currentReplicas : (countValue || 0);
  const remainingVMCapacity = Math.max(0, vmwareCapacity - additionalHosts);

  // REMOVED: Agent availability check - helper text no longer mentions maximum availability
  let helperText = <>{t('Set the number of hosts for this node pool')}</>;

  // Override helper text if VMware template is available (informational only, not limiting)
  if (vmwareTemplate?.status?.resourceUtilization) {
    helperText = (
      <>
        {t('VMware estimated capacity: {{capacity}} VMs remaining', { capacity: remainingVMCapacity })}{' '}
        <PopoverIcon
          bodyContent={t(
            'This shows the estimated number of VMs that can be provisioned based on available VMware resources (CPU, Memory, Storage). This is informational only and does not limit the number of hosts you can configure.',
          )}
        />
      </>
    );
  }

  return (
    <Grid hasGutter>
      {!isEdit && (
        <GridItem>
          {/* LabelSelectorGroup would be imported from ui-lib */}
          <div>Agent label selector (edit mode only)</div>
        </GridItem>
      )}
      <GridItem>
        <CheckboxField name={useAutoscalingName} label={t('Use autoscaling')} />
      </GridItem>
      {useAutoscalingValue ? (
        <>
          <GridItem>
            <NumberInputField
              name={`${autoscalingName}.minReplicas`}
              label={t('Minimum number of hosts')}
              isRequired
              minValue={1}
              maxValue={maxValue || maxAgents}
            />
          </GridItem>
          <GridItem>
            <NumberInputField
              name={`${autoscalingName}.maxReplicas`}
              label={t('Maximum number of hosts')}
              isRequired
              minValue={minValue || 1}
              maxValue={maxAgents}
              helperText={helperText}
            />
          </GridItem>
        </>
      ) : (
        <GridItem>
          <NumberInputField
            label={t('Number of hosts')}
            idPostfix="count"
            name={countName}
            isRequired
            minValue={0}
            maxValue={maxAgents}
            helperText={helperText}
          />
        </GridItem>
      )}
    </Grid>
  );
};

export default NodePoolAgentsForm;
