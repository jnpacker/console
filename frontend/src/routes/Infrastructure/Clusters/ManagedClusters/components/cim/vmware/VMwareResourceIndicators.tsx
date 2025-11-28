/* Copyright Contributors to the Open Cluster Management project */
import { Progress, ProgressVariant, ProgressMeasureLocation, Stack, StackItem } from '@patternfly/react-core'
import { useTranslation } from '../../../../../../../lib/acm-i18next'
import { VMwareNodePoolTemplate } from '../../../../../../../resources'

type VMwareResourceIndicatorsProps = {
  vmwareTemplate?: VMwareNodePoolTemplate
}

export function VMwareResourceIndicators({ vmwareTemplate }: VMwareResourceIndicatorsProps) {
  const { t } = useTranslation()

  if (!vmwareTemplate) {
    return null
  }

  const resourceUtil = vmwareTemplate.status?.resourceUtilization

  if (!resourceUtil) {
    return (
      <div style={{ fontStyle: 'italic', color: '#6a6e73', padding: '16px' }}>
        {t(
          'VMware resource utilization data is not yet available. The VMware controller will populate this information shortly.'
        )}
      </div>
    )
  }

  return (
    <Stack hasGutter style={{ padding: '16px 0' }}>
      <StackItem>
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>{t('VMware Resource Availability')}</div>
      </StackItem>
      <StackItem>
        <div>
          <strong>{t('Storage')}</strong>
          <Progress
            value={resourceUtil.datastore.percentUsed}
            title={`${resourceUtil.datastore.freeSpaceGB} GB Free / ${resourceUtil.datastore.capacityGB} GB Total`}
            variant={
              resourceUtil.datastore.percentUsed > 90
                ? ProgressVariant.danger
                : resourceUtil.datastore.percentUsed > 75
                  ? ProgressVariant.warning
                  : undefined
            }
            measureLocation={ProgressMeasureLocation.outside}
          />
        </div>
      </StackItem>
      <StackItem>
        <div>
          <strong>{t('CPU')}</strong>
          <Progress
            value={resourceUtil.compute.cpuPercentUsed}
            title={`${resourceUtil.compute.cpuAvailableMhz} MHz Available / ${resourceUtil.compute.cpuTotalMhz} MHz Total`}
            variant={
              resourceUtil.compute.cpuPercentUsed > 90
                ? ProgressVariant.danger
                : resourceUtil.compute.cpuPercentUsed > 75
                  ? ProgressVariant.warning
                  : undefined
            }
            measureLocation={ProgressMeasureLocation.outside}
          />
        </div>
      </StackItem>
      <StackItem>
        <div>
          <strong>{t('Memory')}</strong>
          <Progress
            value={resourceUtil.compute.memoryPercentUsed}
            title={`${resourceUtil.compute.memoryAvailableMb} MB Available / ${resourceUtil.compute.memoryTotalMb} MB Total`}
            variant={
              resourceUtil.compute.memoryPercentUsed > 90
                ? ProgressVariant.danger
                : resourceUtil.compute.memoryPercentUsed > 75
                  ? ProgressVariant.warning
                  : undefined
            }
            measureLocation={ProgressMeasureLocation.outside}
          />
        </div>
      </StackItem>
      <StackItem>
        <div>
          <strong>{t('Estimated VM Capacity')}</strong>: {resourceUtil.estimatedVMCapacity}
          {vmwareTemplate.spec.vmTemplate.resourceLimits?.maxVMs !== undefined &&
            ` / ${vmwareTemplate.spec.vmTemplate.resourceLimits.maxVMs} Max VMs`}
        </div>
      </StackItem>
    </Stack>
  )
}
