import { Snackbar, Alert, Slide } from '@mui/material'
import HetTerm from './HetTerm'

interface HetDialogProps {
  cardName: string
  open: boolean
  handleClose: () => void
}
export default function HetDialog(props: HetDialogProps) {
  return (
    <Snackbar
      open={props.open}
      autoHideDuration={5000}
      onClose={props.handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
    >
      <Alert
        onClose={props.handleClose}
        className='border-1 border-solid border-bar-chart-light'
        role='alert'
      >
        Direct link to <HetTerm>{props.cardName}</HetTerm> copied to clipboard!
      </Alert>
    </Snackbar>
  )
}

function SlideTransition(props: any) {
  return <Slide {...props} direction='right' />
}
