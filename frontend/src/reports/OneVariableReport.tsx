import { Box, Grid } from '@mui/material'
import React, { useEffect, useState, Fragment } from 'react'
import LazyLoad from 'react-lazyload'
import { DisparityBarChartCard } from '../cards/DisparityBarChartCard'
import { MapCard } from '../cards/MapCard'
import { PopulationCard } from '../cards/PopulationCard'
import { SimpleBarChartCard } from '../cards/SimpleBarChartCard'
import { AgeAdjustedTableCard } from '../cards/AgeAdjustedTableCard'
import { UnknownsMapCard } from '../cards/UnknownsMapCard'
import { TableCard } from '../cards/TableCard'
import {
  type DropdownVarId,
  METRIC_CONFIG,
  type VariableConfig,
} from '../data/config/MetricConfig'
import { RACE } from '../data/utils/Constants'
import { type Fips } from '../data/utils/Fips'
import {
  DATA_TYPE_1_PARAM,
  DATA_TYPE_2_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  psSubscribe,
  setParameter,
  setParameters,
  swapOldDatatypeParams,
} from '../utils/urlutils'
import { SINGLE_COLUMN_WIDTH } from './ReportProvider'
import NoDataAlert from './ui/NoDataAlert'
import ReportToggleControls from './ui/ReportToggleControls'
import { RateTrendsChartCard } from '../cards/RateTrendsChartCard'
import { ShareTrendsChartCard } from '../cards/ShareTrendsChartCard'
import styles from './Report.module.scss'

import { reportProviderSteps } from './ReportProviderSteps'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import { Helmet } from 'react-helmet-async'
import {
  type BreakdownVar,
  BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE,
  DEMOGRAPHIC_BREAKDOWNS,
} from '../data/query/Breakdowns'
import ShareButtons from './ui/ShareButtons'
import Sidebar from '../pages/ui/Sidebar'

export interface OneVariableReportProps {
  key: string
  dropdownVarId: DropdownVarId
  fips: Fips
  updateFipsCallback: (fips: Fips) => void
  hidePopulationCard?: boolean
  isScrolledToTop: boolean
  reportStepHashIds?: ScrollableHashId[]
  setReportStepHashIds?: (hashIdsOnScreen: any[]) => void
  headerScrollMargin: number
  reportTitle: string
  isMobile: boolean
}

export function OneVariableReport(props: OneVariableReportProps) {
  const [currentBreakdown, setCurrentBreakdown] = useState<BreakdownVar>(
    getParameter(DEMOGRAPHIC_PARAM, RACE)
  )

  const [variableConfig, setVariableConfig] = useState<VariableConfig | null>(
    Object.keys(METRIC_CONFIG).includes(props.dropdownVarId)
      ? METRIC_CONFIG[props.dropdownVarId][0]
      : null
  )

  const setVariableConfigWithParam = (v: VariableConfig) => {
    setParameters([
      { name: DATA_TYPE_1_PARAM, value: v.variableId },
      { name: DATA_TYPE_2_PARAM, value: null },
    ])
    setVariableConfig(v)
  }

  const setDemoWithParam = (str: BreakdownVar) => {
    setParameter(DEMOGRAPHIC_PARAM, str)
    setCurrentBreakdown(str)
  }

  useEffect(() => {
    const readParams = () => {
      const demoParam1 = getParameter(
        DATA_TYPE_1_PARAM,
        undefined,
        (val: string) => {
          val = swapOldDatatypeParams(val)
          return METRIC_CONFIG[props.dropdownVarId].find(
            (cfg) => cfg.variableId === val
          )
        }
      )
      setVariableConfig(demoParam1 ?? METRIC_CONFIG[props.dropdownVarId][0])

      const demo: BreakdownVar = getParameter(DEMOGRAPHIC_PARAM, RACE)
      setCurrentBreakdown(demo)
    }
    const psHandler = psSubscribe(readParams, 'vardisp')
    readParams()
    return () => {
      if (psHandler) {
        psHandler.unsubscribe()
      }
    }
  }, [props.dropdownVarId])

  // when variable config changes (new data type), re-calc available card steps in TableOfContents
  useEffect(() => {
    const hashIdsOnScreen: any[] = Object.keys(reportProviderSteps).filter(
      (key) => document.getElementById(key)?.id !== undefined
    )

    hashIdsOnScreen && props.setReportStepHashIds?.(hashIdsOnScreen)
  }, [variableConfig])

  const breakdownIsShown = (breakdownVar: BreakdownVar) =>
    currentBreakdown === breakdownVar

  const browserTitle = `${
    variableConfig?.variableFullDisplayName ?? 'Data'
  } by ${
    BREAKDOWN_VAR_DISPLAY_NAMES_LOWER_CASE[currentBreakdown]
  } in ${props.fips.getFullDisplayName()}`

  return (
    <>
      <Helmet>
        <title>{browserTitle} - Health Equity Tracker</title>
      </Helmet>
      <Grid container>
        {/* CARDS COLUMN */}
        <Grid item xs={12} sm={11} md={10}>
          <Grid
            item
            container
            xs={12}
            alignItems="center"
            spacing={0}
            justifyContent="center"
          >
            {!props.hidePopulationCard && (
              // POPULATION CARD
              <Grid
                item
                xs={12}
                md={SINGLE_COLUMN_WIDTH}
                tabIndex={-1}
                id="location-info"
                className={styles.ScrollPastHeader}
              >
                <PopulationCard fips={props.fips} />
              </Grid>
            )}

            {!variableConfig && (
              <NoDataAlert dropdownVarId={props.dropdownVarId} />
            )}

            {variableConfig && (
              <Grid container spacing={1} justifyContent="center">
                {/* DEMOGRAPHIC / DATA TYPE TOGGLE(S) */}
                <Grid item container xs={12} md={SINGLE_COLUMN_WIDTH}>
                  <ReportToggleControls
                    dropdownVarId={props.dropdownVarId}
                    variableConfig={variableConfig}
                    setVariableConfig={setVariableConfigWithParam}
                    currentBreakdown={currentBreakdown}
                    setCurrentBreakdown={setDemoWithParam}
                    fips={props.fips}
                  />
                </Grid>

                {/* 100k MAP CARD */}
                <Grid
                  item
                  xs={12}
                  md={SINGLE_COLUMN_WIDTH}
                  tabIndex={-1}
                  id="rate-map"
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <MapCard
                    variableConfig={variableConfig}
                    fips={props.fips}
                    updateFipsCallback={(fips: Fips) => {
                      props.updateFipsCallback(fips)
                    }}
                    currentBreakdown={currentBreakdown}
                  />
                </Grid>

                {/* RATE TRENDS LINE CHART CARD */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={SINGLE_COLUMN_WIDTH}
                  id={
                    variableConfig.timeSeriesData
                      ? 'rates-over-time'
                      : undefined
                  }
                  className={styles.ScrollPastHeader}
                >
                  {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                    <Fragment key={breakdownVar}>
                      {breakdownIsShown(breakdownVar) &&
                        // only show time series 100k chart if MetricConfig has flag turned on
                        variableConfig.timeSeriesData && (
                          <RateTrendsChartCard
                            variableConfig={variableConfig}
                            breakdownVar={breakdownVar}
                            fips={props.fips}
                          />
                        )}
                    </Fragment>
                  ))}
                </Grid>

                {/* 100K BAR CHART CARD */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={SINGLE_COLUMN_WIDTH}
                  tabIndex={-1}
                  id="rate-chart"
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <LazyLoad offset={600} height={750} once>
                    {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                      <Fragment key={breakdownVar}>
                        {breakdownIsShown(breakdownVar) &&
                          variableConfig.metrics.per100k && (
                            <SimpleBarChartCard
                              variableConfig={variableConfig}
                              breakdownVar={breakdownVar}
                              fips={props.fips}
                            />
                          )}
                      </Fragment>
                    ))}
                  </LazyLoad>
                </Grid>

                {/* UNKNOWNS MAP CARD */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={SINGLE_COLUMN_WIDTH}
                  tabIndex={-1}
                  id="unknown-demographic-map"
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <LazyLoad offset={800} height={750} once>
                    {variableConfig.metrics.pct_share && (
                      <UnknownsMapCard
                        overrideAndWithOr={currentBreakdown === RACE}
                        variableConfig={variableConfig}
                        fips={props.fips}
                        updateFipsCallback={(fips: Fips) => {
                          props.updateFipsCallback(fips)
                        }}
                        currentBreakdown={currentBreakdown}
                      />
                    )}
                  </LazyLoad>
                </Grid>

                {/* SHARE TRENDS LINE CHART CARD */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={SINGLE_COLUMN_WIDTH}
                  id={
                    variableConfig.timeSeriesData
                      ? 'inequities-over-time'
                      : undefined
                  }
                  className={styles.ScrollPastHeader}
                >
                  <LazyLoad offset={600} height={750} once>
                    {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                      <Fragment key={breakdownVar}>
                        {breakdownIsShown(breakdownVar) &&
                          // only show time series relative inequity chart if MetricConfig contains flag
                          variableConfig.timeSeriesData && (
                            <ShareTrendsChartCard
                              variableConfig={variableConfig}
                              breakdownVar={breakdownVar}
                              fips={props.fips}
                            />
                          )}
                      </Fragment>
                    ))}
                  </LazyLoad>
                </Grid>

                {/* DISPARITY BAR CHART COMPARE VS POPULATION */}
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={SINGLE_COLUMN_WIDTH}
                  tabIndex={-1}
                  id="population-vs-distribution"
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <LazyLoad offset={800} height={750} once>
                    {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                      <Fragment key={breakdownVar}>
                        {breakdownIsShown(breakdownVar) &&
                          variableConfig.metrics.pct_share && (
                            <DisparityBarChartCard
                              variableConfig={variableConfig}
                              breakdownVar={breakdownVar}
                              fips={props.fips}
                            />
                          )}
                      </Fragment>
                    ))}
                  </LazyLoad>
                </Grid>

                {/* DATA TABLE CARD */}
                <Grid
                  item
                  xs={12}
                  md={SINGLE_COLUMN_WIDTH}
                  tabIndex={-1}
                  id="data-table"
                  style={{
                    scrollMarginTop: props.headerScrollMargin,
                  }}
                >
                  <LazyLoad offset={800} height={750} once>
                    {DEMOGRAPHIC_BREAKDOWNS.map((breakdownVar) => (
                      <Fragment key={breakdownVar}>
                        {breakdownIsShown(breakdownVar) && (
                          <TableCard
                            fips={props.fips}
                            variableConfig={variableConfig}
                            breakdownVar={breakdownVar}
                          />
                        )}
                      </Fragment>
                    ))}
                  </LazyLoad>
                </Grid>

                {/* AGE ADJUSTED TABLE CARD */}
                {variableConfig.metrics.age_adjusted_ratio.ageAdjusted && (
                  <Grid
                    item
                    xs={12}
                    md={SINGLE_COLUMN_WIDTH}
                    tabIndex={-1}
                    id="age-adjusted-risk"
                    style={{
                      scrollMarginTop: props.headerScrollMargin,
                    }}
                  >
                    <LazyLoad offset={800} height={800} once>
                      <AgeAdjustedTableCard
                        fips={props.fips}
                        variableConfig={variableConfig}
                        dropdownVarId={props.dropdownVarId}
                        breakdownVar={currentBreakdown}
                        setVariableConfigWithParam={setVariableConfigWithParam}
                      />
                    </LazyLoad>
                  </Grid>
                )}
                {props.isMobile && (
                  <Box mt={5}>
                    <p>Share to social:</p>
                    <ShareButtons
                      reportTitle={props.reportTitle}
                      isMobile={props.isMobile}
                    />{' '}
                  </Box>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
        {/* TABLE OF CONTENTS COLUMN */}
        {props.reportStepHashIds && (
          <Grid
            item
            // invisible
            xs={12}
            // icons only
            sm={1}
            // icons + text
            md={2}
            container
            direction="column"
            alignItems="center"
            className={styles.FloatingSidebarWrapper}
          >
            <Sidebar
              floatTopOffset={props.headerScrollMargin}
              isScrolledToTop={props.isScrolledToTop}
              reportStepHashIds={props.reportStepHashIds}
              reportTitle={props.reportTitle}
              isMobile={props.isMobile}
            />
          </Grid>
        )}
      </Grid>
    </>
  )
}
