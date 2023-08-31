import {
  Button,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import { ChoroplethMap } from '../charts/ChoroplethMap'
import {
  type MetricId,
  type DataTypeConfig,
  type MetricConfig,
} from '../data/config/MetricConfig'
import { exclude } from '../data/query/BreakdownFilter'
import {
  Breakdowns,
  type DemographicType,
  DEMOGRAPHIC_DISPLAY_TYPES,
  type DemographicTypeDisplayName,
} from '../data/query/Breakdowns'
import {
  MetricQuery,
  type MetricQueryResponse,
} from '../data/query/MetricQuery'
import { AgeSorterStrategy } from '../data/sorting/AgeSorterStrategy'
import {
  ALL,
  NON_HISPANIC,
  UNKNOWN,
  UNKNOWN_RACE,
  UNKNOWN_ETHNICITY,
  type DemographicGroup,
  RACE,
  AGE,
  CROSS_SECTIONAL,
} from '../data/utils/Constants'
import { type Row } from '../data/utils/DatasetTypes'
import { getExtremeValues } from '../data/utils/datasetutils'
import { Fips } from '../data/utils/Fips'
import {
  COMBINED_INCARCERATION_STATES_LIST,
  COMBINED_QUALIFIER,
  PRIVATE_JAILS_QUALIFIER,
} from '../data/providers/IncarcerationProvider'
import {
  CAWP_DATA_TYPES,
  CAWP_DETERMINANTS,
} from '../data/providers/CawpProvider'
import styles from './Card.module.scss'
import CardWrapper from './CardWrapper'
import DropDownMenu from './ui/DropDownMenu'
import { HighestLowestGeosList } from './ui/HighestLowestGeosList'
import MissingDataAlert from './ui/MissingDataAlert'
import { MultiMapDialog } from './ui/MultiMapDialog'
import { MultiMapLink } from './ui/MultiMapLink'
import { findVerboseRating } from './ui/SviAlert'
import { useGuessPreloadHeight } from '../utils/hooks/useGuessPreloadHeight'
import { generateChartTitle, generateSubtitle } from '../charts/utils'
import { useLocation } from 'react-router-dom'
import { type ScrollableHashId } from '../utils/hooks/useStepObserver'
import { useEffect, useState } from 'react'
import {
  getHighestLowestGroupsByFips,
  getMapScheme,
} from '../charts/mapHelperFunctions'
import { Legend } from '../charts/Legend'
import GeoContext, { getPopulationPhrase } from './ui/GeoContext'
import TerritoryCircles from './ui/TerritoryCircles'
import { GridView } from '@mui/icons-material'
import {
  HIGHEST_LOWEST_GEOS_1_PARAM_KEY,
  HIGHEST_LOWEST_GEOS_2_PARAM_KEY,
  MAP1_GROUP_PARAM,
  MAP2_GROUP_PARAM,
  MULTIPLE_MAPS_1_PARAM_KEY,
  MULTIPLE_MAPS_2_PARAM_KEY,
  getDemographicGroupFromGroupParam,
  getGroupParamFromDemographicGroup,
  getParameter,
  setParameter,
} from '../utils/urlutils'
import ChartTitle from './ChartTitle'
import { useParamState } from '../utils/hooks/useParamState'
import { POPULATION, SVI } from '../data/providers/GeoContextProvider'
import { RATE_MAP_SCALE } from '../charts/mapGlobals'

const SIZE_OF_HIGHEST_LOWEST_GEOS_RATES_LIST = 5

export interface CountColsMap {
  numeratorConfig?: MetricConfig
  denominatorConfig?: MetricConfig
}

export interface MapCardProps {
  key?: string
  fips: Fips
  dataTypeConfig: DataTypeConfig
  updateFipsCallback: (fips: Fips) => void
  demographicType: DemographicType
  isCompareCard?: boolean
  reportTitle: string
}

// This wrapper ensures the proper key is set to create a new instance when required (when
// the props change and the state needs to be reset) rather than relying on the card caller.
export function MapCard(props: MapCardProps) {
  return (
    <MapCardWithKey
      key={props.demographicType + props.dataTypeConfig.dataTypeId}
      {...props}
    />
  )
}

function MapCardWithKey(props: MapCardProps) {
  const preloadHeight = useGuessPreloadHeight([750, 1050])

  const metricConfig =
    props.dataTypeConfig?.metrics?.per100k ??
    props.dataTypeConfig?.metrics?.pct_rate ??
    props.dataTypeConfig?.metrics?.index

  if (!metricConfig) return <></>

  const demographicType = props.demographicType

  const isPrison = props.dataTypeConfig.dataTypeId === 'prison'
  const isJail = props.dataTypeConfig.dataTypeId === 'jail'
  const isIncarceration = isJail ?? isPrison
  const isCawp = CAWP_DATA_TYPES.includes(props.dataTypeConfig.dataTypeId)

  const location = useLocation()

  const signalListeners: any = {
    click: (...args: any) => {
      const clickedData = args[1]
      if (clickedData?.id) {
        props.updateFipsCallback(new Fips(clickedData.id))
        location.hash = `#${HASH_ID}`
      }
    },
  }

  const MAP_GROUP_PARAM = props.isCompareCard
    ? MAP2_GROUP_PARAM
    : MAP1_GROUP_PARAM

  const initialGroupParam: string = getParameter(MAP_GROUP_PARAM, ALL)
  const initialGroup = getDemographicGroupFromGroupParam(initialGroupParam)

  const highestLowestGeosParamKey = props.isCompareCard
    ? HIGHEST_LOWEST_GEOS_2_PARAM_KEY
    : HIGHEST_LOWEST_GEOS_1_PARAM_KEY
  const [highestLowestGeosMode, setHighestLowestGeosMode] =
    useParamState<boolean>(highestLowestGeosParamKey, false)

  const [activeDemographicGroup, setActiveDemographicGroup] =
    useState<DemographicGroup>(initialGroup)

  const MULTIMAP_PARAM_KEY = props.isCompareCard
    ? MULTIPLE_MAPS_2_PARAM_KEY
    : MULTIPLE_MAPS_1_PARAM_KEY
  const [multimapOpen, setMultimapOpen] = useParamState<boolean>(
    MULTIMAP_PARAM_KEY,
    false
  )

  const metricQuery = (
    geographyBreakdown: Breakdowns,
    countColsMap?: CountColsMap
  ) => {
    const metricIds: MetricId[] = [metricConfig.metricId]

    countColsMap?.numeratorConfig &&
      metricIds.push(countColsMap.numeratorConfig.metricId)
    countColsMap?.denominatorConfig &&
      metricIds.push(countColsMap.denominatorConfig.metricId)

    return new MetricQuery(
      metricIds,
      geographyBreakdown
        .copy()
        .addBreakdown(
          demographicType,
          demographicType === RACE
            ? exclude(NON_HISPANIC, UNKNOWN, UNKNOWN_RACE, UNKNOWN_ETHNICITY)
            : exclude(UNKNOWN)
        ),
      /* dataTypeId */ props.dataTypeConfig.dataTypeId,
      /* timeView */ isCawp ? CROSS_SECTIONAL : undefined
    )
  }

  const countColsMap: CountColsMap = {
    numeratorConfig: metricConfig?.rateNumeratorMetric,
    denominatorConfig: metricConfig?.rateDenominatorMetric,
  }

  const queries = [
    metricQuery(Breakdowns.forChildrenFips(props.fips), countColsMap),
    metricQuery(Breakdowns.forFips(props.fips)),
  ]

  // Population count
  const popBreakdown = Breakdowns.forFips(props.fips)
  const popQuery = new MetricQuery([POPULATION], popBreakdown)
  queries.push(popQuery)

  // state and county level reports require county-fips data for hover tooltips
  if (!props.fips.isUsa()) {
    const sviBreakdowns = Breakdowns.byCounty()
    sviBreakdowns.filterFips = props.fips
    const sviQuery = new MetricQuery([SVI], sviBreakdowns)
    queries.push(sviQuery)
  }

  let selectedRaceSuffix = ''
  if (
    CAWP_DETERMINANTS.includes(metricConfig.metricId) &&
    activeDemographicGroup !== ALL
  ) {
    selectedRaceSuffix = ` and also identifying as ${activeDemographicGroup}`
  }

  let qualifierMessage = ''
  if (isPrison) qualifierMessage = COMBINED_QUALIFIER
  if (isJail) qualifierMessage = PRIVATE_JAILS_QUALIFIER

  let qualifierItems: string[] = []
  if (isIncarceration) qualifierItems = COMBINED_INCARCERATION_STATES_LIST

  const { metricId, chartTitle } = metricConfig
  const title = generateChartTitle(chartTitle, props.fips)
  let subtitle = generateSubtitle(
    activeDemographicGroup,
    demographicType,
    metricId
  )
  if (highestLowestGeosMode)
    subtitle += ` (only ${
      props.fips.getPluralChildFipsTypeDisplayName() ?? 'places'
    } with highest/lowest rates)`
  const filename = `${title} ${subtitle ? `for ${subtitle}` : ''}`
  const HASH_ID: ScrollableHashId = 'rate-map'

  const theme = useTheme()
  const pageIsSmall = useMediaQuery(theme.breakpoints.down('sm'))
  const isCompareMode = window.location.href.includes('compare')
  const mapIsWide = !pageIsSmall && !isCompareMode

  const fipsTypeDisplayName = props.fips.getFipsTypeDisplayName()

  const [scale, setScale] = useState<{ domain: number[]; range: number[] }>({
    domain: [],
    range: [],
  })

  function handleScaleChange(domain: number[], range: number[]) {
    // Update the scale state when the domain or range changes
    setScale({ domain, range })
  }

  const elementsToHide = [
    '#map-group-dropdown',
    '#download-card-image-button',
    '#card-options-menu',
  ]

  return (
    <CardWrapper
      downloadTitle={filename}
      queries={queries}
      loadGeographies={true}
      minHeight={preloadHeight}
      scrollToHash={HASH_ID}
      reportTitle={props.reportTitle}
      elementsToHide={elementsToHide}
      expanded={highestLowestGeosMode}
    >
      {(queryResponses, metadata, geoData) => {
        // contains rows for sub-geos (if viewing US, this data will be STATE level)
        const childGeoQueryResponse: MetricQueryResponse = queryResponses[0]
        // contains data rows current level (if viewing US, this data will be US level)
        const parentGeoQueryResponse = queryResponses[1]
        const hasSelfButNotChildGeoData =
          childGeoQueryResponse.data.filter((row) => row[metricConfig.metricId])
            .length === 0 &&
          parentGeoQueryResponse.data.filter(
            (row) => row[metricConfig.metricId]
          ).length > 0
        const mapQueryResponse = hasSelfButNotChildGeoData
          ? parentGeoQueryResponse
          : childGeoQueryResponse

        const totalPopulationPhrase = getPopulationPhrase(queryResponses[2])
        const sviQueryResponse: MetricQueryResponse = queryResponses[3] || null
        const sortArgs =
          props.demographicType === AGE
            ? ([new AgeSorterStrategy([ALL]).compareFn] as any)
            : []

        const fieldValues = mapQueryResponse.getFieldValues(
          /* fieldName: DemographicType */ props.demographicType,
          /* relevantMetric: MetricId */ metricConfig.metricId
        )

        const demographicGroups: DemographicGroup[] =
          fieldValues.withData.sort.apply(fieldValues.withData, sortArgs)

        let dataForActiveDemographicGroup = mapQueryResponse
          .getValidRowsForField(metricConfig.metricId)
          .filter(
            (row: Row) => row[props.demographicType] === activeDemographicGroup
          )

        const allDataForActiveDemographicGroup = mapQueryResponse.data.filter(
          (row: Row) => row[props.demographicType] === activeDemographicGroup
        )

        const dataForSvi: Row[] =
          sviQueryResponse
            ?.getValidRowsForField(SVI)
            ?.filter((row) =>
              dataForActiveDemographicGroup.find(
                ({ fips }) => row.fips === fips
              )
            ) || []

        if (!props.fips.isUsa()) {
          dataForActiveDemographicGroup = dataForActiveDemographicGroup.map(
            (row) => {
              const thisCountySviRow = dataForSvi.find(
                (sviRow) => sviRow.fips === row.fips
              )
              return {
                ...row,
                rating: findVerboseRating(thisCountySviRow?.svi),
              }
            }
          )
        }

        const { highestValues, lowestValues } = getExtremeValues(
          dataForActiveDemographicGroup,
          metricConfig.metricId,
          SIZE_OF_HIGHEST_LOWEST_GEOS_RATES_LIST
        )

        // Create and populate a map of demographicType display name to options
        const filterOptions: Record<
          DemographicTypeDisplayName,
          DemographicGroup[]
        > = {
          [DEMOGRAPHIC_DISPLAY_TYPES[props.demographicType]]: demographicGroups,
        }

        const hideGroupDropdown =
          Object.values(filterOptions).toString() === ALL

        // if a previously selected group is no longer valid, reset to ALL
        let dropdownValue = ALL
        if (
          filterOptions[
            DEMOGRAPHIC_DISPLAY_TYPES[props.demographicType]
          ].includes(activeDemographicGroup)
        ) {
          dropdownValue = activeDemographicGroup
        } else {
          setActiveDemographicGroup(ALL)
          setParameter(MAP_GROUP_PARAM, ALL)
        }

        function handleMapGroupClick(_: any, newGroup: DemographicGroup) {
          setActiveDemographicGroup(newGroup)
          const groupCode = getGroupParamFromDemographicGroup(newGroup)
          setParameter(MAP_GROUP_PARAM, groupCode)
        }

        const displayData = highestLowestGeosMode
          ? highestValues.concat(lowestValues)
          : dataForActiveDemographicGroup

        const isSummaryLegend =
          hasSelfButNotChildGeoData ?? props.fips.isCounty()

        const [mapScheme, mapMin] = getMapScheme({
          metricId: metricConfig.metricId,
          isSummaryLegend,
        })

        useEffect(() => {
          if (dataForActiveDemographicGroup?.length <= 1)
            setHighestLowestGeosMode(false)
        }, [props.fips])

        if (!dataForActiveDemographicGroup?.length || !metricConfig)
          return (
            <CardContent>
              <Grid item xs={12}>
                <ChartTitle
                  mt={0}
                  mb={2}
                  title={'Rate map unavailable: ' + title}
                  subtitle={subtitle}
                />
              </Grid>
              <MissingDataAlert
                dataName={title}
                demographicTypeString={
                  DEMOGRAPHIC_DISPLAY_TYPES[props.demographicType]
                }
                isMapCard={true}
                fips={props.fips}
              />
            </CardContent>
          )

        return (
          <>
            <MultiMapDialog
              dataTypeConfig={props.dataTypeConfig}
              demographicType={props.demographicType}
              demographicGroups={demographicGroups}
              demographicGroupsNoData={fieldValues.noData}
              countColsMap={countColsMap}
              data={mapQueryResponse.data}
              fieldRange={mapQueryResponse.getFieldRange(metricConfig.metricId)}
              fips={props.fips}
              geoData={geoData}
              handleClose={() => {
                setMultimapOpen(false)
              }}
              handleMapGroupClick={handleMapGroupClick}
              hasSelfButNotChildGeoData={hasSelfButNotChildGeoData}
              metadata={metadata}
              metricConfig={metricConfig}
              open={Boolean(multimapOpen)}
              queries={queries}
              queryResponses={queryResponses}
              totalPopulationPhrase={totalPopulationPhrase}
              updateFipsCallback={props.updateFipsCallback}
              useSmallSampleMessage={
                !mapQueryResponse.dataIsMissing() &&
                (props.dataTypeConfig.surveyCollectedData ?? false)
              }
              pageIsSmall={pageIsSmall}
              reportTitle={props.reportTitle}
              scrollToHash={HASH_ID}
            />

            {!mapQueryResponse.dataIsMissing() && !hideGroupDropdown && (
              <>
                <CardContent className={styles.MapControlsContent}>
                  <Grid
                    container
                    justifyContent="space-between"
                    align-items="flex-end"
                    id={'map-group-dropdown'}
                  >
                    <Grid item>
                      <DropDownMenu
                        idSuffix={`-${props.fips.code}-${props.dataTypeConfig.dataTypeId}`}
                        demographicType={props.demographicType}
                        dataTypeId={props.dataTypeConfig.dataTypeId}
                        setMultimapOpen={setMultimapOpen}
                        value={dropdownValue}
                        options={filterOptions}
                        onOptionUpdate={handleMapGroupClick}
                      />
                      <Divider />
                      <Button
                        onClick={() => {
                          setMultimapOpen(true)
                        }}
                      >
                        <GridView />
                        <span className={styles.CompareMultipleText}>
                          View multiple maps
                        </span>
                      </Button>
                    </Grid>
                    <Divider />
                  </Grid>
                </CardContent>
              </>
            )}

            <div>
              <CardContent sx={{ pt: 0 }}>
                <Grid container>
                  <Grid item xs={12}>
                    <ChartTitle
                      mt={0}
                      mb={2}
                      title={title}
                      subtitle={subtitle}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={mapIsWide ? 9 : 12}
                    lg={mapIsWide ? 10 : 12}
                  >
                    <ChoroplethMap
                      demographicType={props.demographicType}
                      highestLowestGroupsByFips={getHighestLowestGroupsByFips(
                        mapQueryResponse.data,
                        props.demographicType,
                        metricId
                      )}
                      activeDemographicGroup={activeDemographicGroup}
                      countColsMap={countColsMap}
                      data={displayData}
                      filename={filename}
                      fips={props.fips}
                      geoData={geoData}
                      hideLegend={true}
                      hideMissingDataTooltip={highestLowestGeosMode}
                      legendData={dataForActiveDemographicGroup}
                      legendTitle={metricConfig.shortLabel.toLowerCase()}
                      highestLowestGeosMode={highestLowestGeosMode}
                      metric={metricConfig}
                      showCounties={
                        !props.fips.isUsa() && !hasSelfButNotChildGeoData
                      }
                      signalListeners={signalListeners}
                      mapConfig={{ mapScheme, mapMin }}
                      scaleConfig={scale}
                    />
                    {props.fips.isUsa() && (
                      <Grid item xs={12}>
                        <TerritoryCircles
                          demographicType={props.demographicType}
                          activeDemographicGroup={activeDemographicGroup}
                          countColsMap={countColsMap}
                          data={displayData}
                          fullData={mapQueryResponse.data}
                          geoData={geoData}
                          highestLowestGeosMode={highestLowestGeosMode}
                          mapIsWide={mapIsWide}
                          metricConfig={metricConfig}
                          signalListeners={signalListeners}
                          scaleConfig={scale}
                        />
                      </Grid>
                    )}
                  </Grid>
                  {/* Legend */}
                  <Grid
                    container
                    justifyItems={'center'}
                    alignItems={'flex-start'}
                    item
                    xs={12}
                    sm={mapIsWide ? 3 : 12}
                    lg={mapIsWide ? 2 : 12}
                  >
                    <Legend
                      dataTypeConfig={props.dataTypeConfig}
                      metric={metricConfig}
                      legendTitle={metricConfig.shortLabel}
                      data={allDataForActiveDemographicGroup}
                      scaleType={RATE_MAP_SCALE}
                      sameDotSize={true}
                      description={'Legend for rate map'}
                      isSummaryLegend={isSummaryLegend}
                      fipsTypeDisplayName={fipsTypeDisplayName}
                      mapConfig={{ mapScheme, mapMin }}
                      columns={mapIsWide ? 1 : 3}
                      stackingDirection={'vertical'}
                      handleScaleChange={handleScaleChange}
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    container
                    justifyContent={'space-between'}
                    alignItems={'center'}
                  >
                    <Grid item>
                      <GeoContext
                        fips={props.fips}
                        updateFipsCallback={props.updateFipsCallback}
                        dataTypeConfig={props.dataTypeConfig}
                        totalPopulationPhrase={totalPopulationPhrase}
                        sviQueryResponse={sviQueryResponse}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  id={
                    props.isCompareCard
                      ? HIGHEST_LOWEST_GEOS_2_PARAM_KEY
                      : HIGHEST_LOWEST_GEOS_1_PARAM_KEY
                  }
                >
                  {!mapQueryResponse.dataIsMissing() &&
                    dataForActiveDemographicGroup.length > 1 && (
                      <HighestLowestGeosList
                        dataTypeConfig={props.dataTypeConfig}
                        selectedRaceSuffix={selectedRaceSuffix}
                        metricConfig={metricConfig}
                        isOpen={highestLowestGeosMode}
                        setIsOpen={setHighestLowestGeosMode}
                        highestValues={highestValues}
                        lowestValues={lowestValues}
                        parentGeoQueryResponse={parentGeoQueryResponse}
                        fips={props.fips}
                        qualifierItems={qualifierItems}
                        qualifierMessage={qualifierMessage}
                        demographicType={demographicType}
                        activeDemographicGroup={activeDemographicGroup}
                      />
                    )}
                </Grid>
              </CardContent>

              {!mapQueryResponse.dataIsMissing() &&
                dataForActiveDemographicGroup.length === 0 &&
                activeDemographicGroup !== ALL && (
                  <CardContent>
                    <Alert severity="warning" role="note">
                      Insufficient data available for filter:{' '}
                      <b>{activeDemographicGroup}</b>.{' '}
                      {/* Offer multimap link if current demo group is missing info */}
                      <MultiMapLink
                        setMultimapOpen={setMultimapOpen}
                        demographicType={props.demographicType}
                        currentDataType={props.dataTypeConfig.fullDisplayName}
                      />
                    </Alert>
                  </CardContent>
                )}
            </div>
          </>
        )
      }}
    </CardWrapper>
  )
}
