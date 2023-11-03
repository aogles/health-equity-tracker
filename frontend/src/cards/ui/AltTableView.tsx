import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import WarningRoundedIcon from '@mui/icons-material/WarningRounded'
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'
import React, { useRef } from 'react'
import AnimateHeight from 'react-animate-height'
import { type MetricConfig } from '../../data/config/MetricConfig'
import { type DemographicType } from '../../data/query/Breakdowns'
import {
  type DemographicGroup,
  TIME_PERIOD_LABEL,
  AGE,
  ALL,
} from '../../data/utils/Constants'
import { makeA11yTableData } from '../../data/utils/DatasetTimeUtils'
import { type Row } from '../../data/utils/DatasetTypes'
import { DATA_TAB_LINK } from '../../utils/internalRoutes'
import styles from './AltTableView.module.scss'
import {
  ALT_TABLE_VIEW_1_PARAM_KEY,
  ALT_TABLE_VIEW_2_PARAM_KEY,
} from '../../utils/urlutils'

interface AltTableViewProps {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  expandBoxLabel: string
  tableCaption: string
  knownsData: Row[]
  unknownsData: Row[]
  demographicType: DemographicType
  knownMetricConfig: MetricConfig
  unknownMetricConfig?: MetricConfig
  selectedGroups: DemographicGroup[]
  hasUnknowns: boolean
  isCompareCard?: boolean
}

export default function AltTableView(props: AltTableViewProps) {
  const tableRef = useRef(null)
  const linkRef = useRef(null)
  const optionalAgesPrefix = props.demographicType === AGE ? 'Ages ' : ''

  const accessibleData = makeA11yTableData(
    props.knownsData,
    props.unknownsData,
    props.demographicType,
    props.knownMetricConfig,
    props.unknownMetricConfig,
    props.selectedGroups,
    props.hasUnknowns
  )

  const firstTimePeriod: string = accessibleData[0][TIME_PERIOD_LABEL]
  const lastTimePeriod: string =
    accessibleData[accessibleData.length - 1][TIME_PERIOD_LABEL]

  return (
    <AnimateHeight
      duration={500}
      height={props.expanded ? 'auto' : 47}
      onAnimationEnd={() => window.dispatchEvent(new Event('resize'))}
      className={styles.AltTableExpanderBox}
      id={
        props.isCompareCard
          ? ALT_TABLE_VIEW_2_PARAM_KEY
          : ALT_TABLE_VIEW_1_PARAM_KEY
      }
    >
      <div className={styles.CollapseButton}>
        <IconButton
          aria-label={`${
            !props.expanded ? 'Expand' : 'Collapse'
          } data table view of ${props.expandBoxLabel}`}
          aria-expanded={props.expanded}
          onClick={() => {
            props.setExpanded(!props.expanded)
          }}
          color='primary'
          size='large'
        >
          {props.expanded ? <ArrowDropUp /> : <ArrowDropDown />}
        </IconButton>
      </div>
      <div
        onClick={() => {
          props.setExpanded(!props.expanded)
        }}
        aria-hidden={true}
        className={
          props.expanded ? styles.AltTableTitleExpanded : styles.AltTableTitle
        }
      >
        {!props.expanded ? 'Expand' : 'Collapse'} <b>{props.expandBoxLabel}</b>{' '}
        table
      </div>

      {/* Don't render collapsed info, so keyboard nav will skip */}
      {props.expanded && (
        <>
          <p>
            Add or remove columns by toggling demographic groups above the
            chart.
          </p>
          <TableContainer className={styles.AltTableContainer}>
            <Table
              tabIndex={0}
              ref={tableRef}
              className={styles.AltTable}
              size='small'
              stickyHeader
            >
              <caption>
                <b>{props.tableCaption}</b>
              </caption>
              <TableHead>
                <TableRow>
                  {Object.keys(accessibleData[0]).map((key, i) => {
                    const isTimeCol = key === TIME_PERIOD_LABEL
                    const isUnknownPctCol = key.includes('with unknown ')

                    const dataColumnLabel = props.knownMetricConfig.shortLabel

                    return (
                      <TableCell
                        key={key}
                        style={{
                          whiteSpace: 'normal',
                          wordWrap: 'break-word',
                        }}
                      >
                        {!isTimeCol &&
                          key !== ALL &&
                          !isUnknownPctCol &&
                          optionalAgesPrefix}
                        {key.replaceAll('_', ' ')}
                        {!isTimeCol &&
                          !isUnknownPctCol &&
                          ` ${dataColumnLabel}`}
                        {isTimeCol &&
                          ` (${firstTimePeriod} - ${lastTimePeriod})`}
                      </TableCell>
                    )
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {accessibleData.map((row, i) => {
                  const keys = Object.keys(row)
                  return (
                    <TableRow key={row[TIME_PERIOD_LABEL]}>
                      {keys.map((key, j) => {
                        const isTimePeriod = key === TIME_PERIOD_LABEL

                        const appendPct =
                          key.includes('with unknown ') ||
                          [
                            'pct_relative_inequity',
                            'pct_share',
                            'pct_rate',
                          ].includes(props.knownMetricConfig.type)
                        return (
                          <TableCell
                            key={key}
                            style={{
                              whiteSpace: 'normal',
                              wordWrap: 'break-word',
                            }}
                          >
                            {row[key] == null ? (
                              <>
                                <Tooltip title='Insufficient data'>
                                  <WarningRoundedIcon />
                                </Tooltip>
                                <span
                                  className={styles.ScreenreaderTitleHeader}
                                >
                                  Insufficient data
                                </span>
                              </>
                            ) : (
                              <>
                                {isTimePeriod ? row[key] : Math.round(row[key])}
                                {!isTimePeriod && appendPct ? '%' : ''}
                              </>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <p>
            View and download full .csv files on the{' '}
            <a href={DATA_TAB_LINK} ref={linkRef}>
              Downloads page.
            </a>
          </p>
        </>
      )}
    </AnimateHeight>
  )
}
