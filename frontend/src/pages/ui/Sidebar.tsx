import { Card } from '@mui/material'
import { type ScrollableHashId } from '../../utils/hooks/useStepObserver'
import styles from './Sidebar.module.scss'
import { MADLIB_MODE_MAP, type MadLibId } from '../../utils/MadLibs'
import { type DemographicType } from '../../data/query/Breakdowns'
import SimpleSelect from './SimpleSelect'
import TableOfContents from './TableOfContents'
import TopicInfoModalButton from './TopicInfoModalButton'

const TABLE_OF_CONTENT_PADDING = 15

/*
  reportStepHashIds: ScrollableHashId[]; Array of TOC "hashIds" used to map the hashId to the step display name
  isScrolledToTop?: boolean; Optionally send in top scroll status; when true none of the steps will be highlighted
*/

interface SidebarProps {
  reportStepHashIds: ScrollableHashId[]
  floatTopOffset?: number
  isScrolledToTop?: boolean
  reportTitle: string
  isMobile: boolean
  trackerMode: MadLibId
  setTrackerMode: React.Dispatch<React.SetStateAction<MadLibId>>
  demographicType: DemographicType
  setDemographicType: (demographic: DemographicType) => void
  isRaceBySex?: boolean
  enabledDemographicOptionsMap: any
  disabledDemographicOptions?: string[][]
}

export default function Sidebar(props: SidebarProps) {
  const tocOffset = (props.floatTopOffset ?? 0) + TABLE_OF_CONTENT_PADDING

  return (
    <>
      <div className={styles.StickySidebarBox} style={{ top: tocOffset }}>
        <Card className={styles.SidebarTopicInfoButtonBox} raised={true}>
          <TopicInfoModalButton />
        </Card>
        <div className='mode-selector-box'>
          <Card raised={true} className={styles.SidebarModeSelectorBox}>
            <SimpleSelect<DemographicType>
              label='Demographic'
              optionsMap={props.enabledDemographicOptionsMap}
              disabledOptions={props.disabledDemographicOptions}
              selected={props.demographicType}
              setSelected={props.setDemographicType}
            />
            <SimpleSelect<MadLibId>
              label='Compare mode'
              optionsMap={MADLIB_MODE_MAP}
              selected={props.trackerMode}
              setSelected={props.setTrackerMode}
            />
          </Card>
        </div>

        <Card raised={true} className={styles.TableOfContentsBox}>
          <TableOfContents
            reportStepHashIds={props.reportStepHashIds}
            isScrolledToTop={props.isScrolledToTop ?? false}
          />
        </Card>
      </div>
    </>
  )
}
