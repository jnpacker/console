/* Copyright Contributors to the Open Cluster Management project */
import React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { NumberInputField, PopoverIcon } from '@openshift-assisted/ui-lib/common';
import { AgentK8sResource } from '@openshift-assisted/ui-lib/cim';
import { useFormikContext } from 'formik';
import { useTranslation } from '../../../../../../../lib/acm-i18next';

type ClusterScaleUpAutoHostsSelectionProps = {
  availableAgents: AgentK8sResource[];
};

type FormValues = {
  hostCount: number;
  agentLabels: any[];
  locations: string[];
  cpuArchitecture: string;
  selectedHostIds: string[];
  autoSelectedHostIds: string[];
  autoSelectHosts: boolean;
};

// Custom hook to handle agent auto-selection logic
const useAgentsAutoSelection = (availableAgents: AgentK8sResource[]) => {
  const { values, setFieldValue } = useFormikContext<FormValues>();
  const { hostCount, agentLabels, locations } = values;

  const matchingAgents = React.useMemo(() => {
    return availableAgents.filter((agent) => {
      // Filter by labels
      const matchesLabels = agentLabels.every(({ key, value }: any) =>
        agent.metadata?.labels?.[key] === value
      );

      // Filter by locations if specified
      const matchesLocation = !locations || locations.length === 0 ||
        locations.includes(agent.status?.inventory?.hostname || '');

      return matchesLabels && matchesLocation;
    });
  }, [availableAgents, agentLabels, locations]);

  const selectedAgents = React.useMemo(() => {
    return matchingAgents.slice(0, hostCount);
  }, [matchingAgents, hostCount]);

  React.useEffect(() => {
    const selectedIds = selectedAgents.map((agent) => agent.metadata?.uid || '');
    setFieldValue('autoSelectedHostIds', selectedIds);
  }, [selectedAgents, setFieldValue]);

  return { matchingAgents, selectedAgents, hostCount };
};

// Simple label icon component
const AgentsSelectionHostCountLabelIcon = () => {
  const { t } = useTranslation();
  return (
    <PopoverIcon
      bodyContent={t('Select the number of hosts to add to the cluster')}
    />
  );
};

// Simple alerts component
const AgentsSelectionHostCountAlerts: React.FC<{
  matchingAgentsCount: number;
  selectedAgents: AgentK8sResource[];
  targetHostCount: number;
}> = ({ matchingAgentsCount, selectedAgents, targetHostCount }) => {
  const { t } = useTranslation();

  if (selectedAgents.length < targetHostCount) {
    return (
      <div style={{ color: '#C9190B', marginTop: '1rem' }}>
        {t('Not enough agents available. Only {{count}} agents match the criteria.', {
          count: matchingAgentsCount
        })}
      </div>
    );
  }

  return null;
};

// LocationsSelector placeholder (simplified version)
const LocationsSelector: React.FC<{ agents: AgentK8sResource[] }> = () => {
  return null; // Simplified - locations filtering not needed for this fix
};

const ClusterScaleUpAutoHostsSelection: React.FC<ClusterScaleUpAutoHostsSelectionProps> = ({
  availableAgents,
}) => {
  const { matchingAgents, selectedAgents, hostCount } = useAgentsAutoSelection(availableAgents);
  const { t } = useTranslation();

  return (
    <>
      <Grid hasGutter>
        <GridItem span={12} lg={10} xl={9} xl2={7}>
          <NumberInputField
            label={t('Number of hosts')}
            labelIcon={<AgentsSelectionHostCountLabelIcon />}
            idPostfix="hostcount"
            name="hostCount"
            minValue={1}
            maxValue={999999}
            isRequired
          />
        </GridItem>
        <GridItem span={12} lg={10} xl={9} xl2={7}>
          <LocationsSelector agents={availableAgents} />
        </GridItem>
      </Grid>

      <AgentsSelectionHostCountAlerts
        matchingAgentsCount={matchingAgents.length}
        selectedAgents={selectedAgents}
        targetHostCount={hostCount}
      />
    </>
  );
};

export default ClusterScaleUpAutoHostsSelection;
