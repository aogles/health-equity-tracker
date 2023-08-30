import HivProvider from './HivProvider'
import { Breakdowns, DemographicType } from '../query/Breakdowns'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { Fips } from '../utils/Fips'
import { DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import FakeDataFetcher from '../../testing/FakeDataFetcher'
import { RACE, AGE, SEX } from '../utils/Constants'
import { DataTypeId } from '../config/MetricConfig'
import { appendFipsIfNeeded } from '../utils/datasetutils'

describe('Unit tests for method getDatasetId()', () => {
  const hivProvider = new HivProvider()

  test('Black women nationally', async () => {
    const breakdowns = new Breakdowns('national').andAge()
    expect(
      hivProvider.getDatasetId(breakdowns, 'hiv_deaths_black_women')
    ).toEqual('cdc_hiv_data-black_women_national_time_series')
  })

  test('Race nationally', async () => {
    const breakdowns = new Breakdowns('national').andRace()
    expect(hivProvider.getDatasetId(breakdowns)).toEqual(
      'cdc_hiv_data-race_and_ethnicity_national_time_series-with_age_adjust'
    )
  })

  test('Sex nationally', async () => {
    const breakdowns = new Breakdowns('national').andSex()
    expect(hivProvider.getDatasetId(breakdowns)).toEqual(
      'cdc_hiv_data-sex_national_time_series'
    )
  })

  test('County race', async () => {
    const breakdowns = new Breakdowns(
      'county',
      undefined,
      undefined,
      new Fips('01001')
    ).andRace()
    expect(hivProvider.getDatasetId(breakdowns)).toEqual(
      'cdc_hiv_data-race_and_ethnicity_county_time_series'
    )
  })
})

export async function ensureCorrectDatasetsDownloaded(
  hivDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
  dataTypeId: DataTypeId
) {
  const hivProvider = new HivProvider()
  const specificId = appendFipsIfNeeded(hivDatasetId, baseBreakdown)
  dataFetcher.setFakeDatasetLoaded(specificId, [])

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await hivProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(demographicType), dataTypeId)
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  const consumedDatasetIds = [hivDatasetId]

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds)
  )
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

interface TestCase {
  name: string
  datasetId: DatasetId
  breakdowns: Breakdowns
  demographicType: DemographicType
  dataTypeId: DataTypeId
}

const testCases: TestCase[] = [
  {
    name: 'County and Sex Breakdown for PrEP',
    datasetId: 'cdc_hiv_data-sex_county_time_series',
    breakdowns: Breakdowns.forFips(new Fips('06037')),
    demographicType: SEX,
    dataTypeId: 'hiv_prep',
  },
  {
    name: 'State and Race Breakdown Deaths',
    datasetId:
      'cdc_hiv_data-race_and_ethnicity_state_time_series-with_age_adjust',
    breakdowns: Breakdowns.forFips(new Fips('37')),
    demographicType: RACE,
    dataTypeId: 'hiv_deaths',
  },
  {
    name: 'State and Age Breakdown PrEP',
    datasetId: 'cdc_hiv_data-age_state_time_series',
    breakdowns: Breakdowns.forFips(new Fips('37')),
    demographicType: AGE,
    dataTypeId: 'hiv_prep',
  },
  {
    name: 'State and Sex Breakdown Diagnoses',
    datasetId: 'cdc_hiv_data-sex_state_time_series',
    breakdowns: Breakdowns.forFips(new Fips('37')),
    demographicType: SEX,
    dataTypeId: 'hiv_diagnoses',
  },
]

describe('HivProvider Integration Tests', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  testCases.forEach((testCase) => {
    test(testCase.name, async () => {
      await ensureCorrectDatasetsDownloaded(
        testCase.datasetId,
        testCase.breakdowns,
        testCase.demographicType,
        testCase.dataTypeId
      )
    })
  })
})
