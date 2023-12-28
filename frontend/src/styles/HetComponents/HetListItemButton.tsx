import { ListItemButton } from '@mui/material'
import { type ReactNode } from 'react'

type HetListItemButtonOptionType = 'boldGreen' | 'normalBlack'

interface HetListItemButtonProps {
  children: ReactNode
  onClick?: () => void
  id?: string
  className?: string
  ariaLabel?: string
  selected?: boolean
  option?: HetListItemButtonOptionType
}

const optionsToClasses: Record<HetListItemButtonOptionType, string> = {
  boldGreen: 'py-2 pl-0 font-sansTitle text-small font-medium no-underline',
  normalBlack: 'py-1 pl-2 text-small font-light text-altBlack',
}

export default function HetListItemButton(props: HetListItemButtonProps) {
  return (
    <ListItemButton
      className='py-0'
      onClick={props.onClick}
      aria-label={props.ariaLabel}
      selected={props.selected}
    >
      <span
        className={`py-0 ${optionsToClasses[props.option ?? 'boldGreen']} ${
          props.className ?? ''
        }`}
      >
        {props.children}
      </span>
    </ListItemButton>
  )
}
