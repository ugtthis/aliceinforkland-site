import type { Component } from 'solid-js'

import ResponsiveModal from '~/components/ui/ResponsiveModal'

type WarningModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const WarningModal: Component<WarningModalProps> = (props) => (
  <ResponsiveModal
    open={props.open}
    onOpenChange={props.onOpenChange}
    title="Warning"
    description="Warning information"
    desktopMaxHeight="700px"
  >
    <div class="min-h-[240px] flex-1 p-6" />
  </ResponsiveModal>
)

export default WarningModal
