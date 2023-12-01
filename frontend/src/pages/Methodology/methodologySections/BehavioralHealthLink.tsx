import { Alert, AlertTitle } from '@mui/material'
import {
  behavioralHealthDataSources,
  behavioralHealthDefinitionsArray,
} from '../methodologyContent/BehavioralHealthDefinitions'
import KeyTerms from '../methodologyComponents/KeyTerms'
import { MENTAL_HEALTH_RESOURCES } from '../../WhatIsHealthEquity/ResourcesData'
import Resources from '../methodologyComponents/Resources'
import StripedTable from '../methodologyComponents/StripedTable'
import { Helmet } from 'react-helmet-async'
import { CodeBlock } from '../methodologyComponents/CodeBlock'
import {
  percentShareTooltip,
  totalCasesPer100kPeopleTooltip,
} from '../methodologyContent/TooltipLibrary'
import { DATA_CATALOG_PAGE_LINK } from '../../../utils/internalRoutes'
import { DATA_SOURCE_PRE_FILTERS } from '../../../utils/urlutils'
import LifelineAlert from '../../../reports/ui/LifelineAlert'
import DefinitionTooltip from '../methodologyComponents/DefinitionTooltip'
import { definitionsGlossary } from '../methodologyContent/DefinitionGlossary'

const BehavioralHealthLink: React.FC = () => {
  return (
    <section id='#behavioral-health'>
      <article>
        <Helmet>
          <title>Behavioral Health - Health Equity Tracker</title>
        </Helmet>
        <h2 className='sr-only'>Behavioral Health</h2>

        <StripedTable
          id='#categories-table'
          applyThickBorder={false}
          columns={[
            { header: 'Category', accessor: 'category' },
            { header: 'Topics', accessor: 'topic' },
            { header: 'Variables', accessor: 'variable' },
          ]}
          rows={[
            {
              category: 'Behavioral Health',
              topic:
                'Depression, Excessive Drinking, Frequent Mental Distress, Suicide, Opioid and Substance Misuse',
              variable: 'Race/ethnicity, Sex, Age',
            },
          ]}
        />
        <h3
          className='font-sansTitle text-title'
          id='#behavioral-health-data-sourcing'
        >
          Data Sourcing
        </h3>
        <p>
          The data on behavioral health conditions such as frequent mental
          distress, depression, and excessive drinking, featured in the Health
          Equity Tracker, primarily comes from{' '}
          <a href={'urlMap.amr'}>America’s Health Rankings (AHR)</a>. AHR
          primarily relies on the{' '}
          <a href={'urlMap.cdcBrfss'}>
            Behavioral Risk Factor Surveillance System (BRFSS)
          </a>{' '}
          survey conducted by the CDC, supplemented by data from{' '}
          <a href={'urlMap.cdcWonder'}>CDC WONDER</a> and the{' '}
          <a href={'urlMap.censusVoting'}>U.S. Census</a>.{' '}
        </p>
        <Alert severity='info' role='note'>
          <AlertTitle>
            A note about the CDC's Behavioral Risk Factor Surveillance System
            (BRFSS) survey
          </AlertTitle>
          <p>
            It's important to note that because BRFSS is survey-based, it
            sometimes lacks sufficient data for smaller or marginalized racial
            groups, making some estimates less statistically robust.
          </p>
          <p>
            Additionally, BRFSS data by race and ethnicity is not available at
            the county level, limiting our tracker's granularity for these
            metrics.
          </p>
        </Alert>
        <p>
          We obtain our data for the following specific issues directly from
          America's Health Rankings (AHR). This data is based on{' '}
          {percentShareTooltip} metrics that AHR provides in downloadable data
          files. Click on the following to explore the reports:
        </p>
        <ul className='list-none pl-0'>
          <li className='font-sansTitle font-medium'>
            <a
              className='no-underline'
              href='https://healthequitytracker.org/exploredata?mls=1.suicide-3.00&group1=All'
            >
              suicide
            </a>
          </li>
          <li className='font-sansTitle font-medium'>
            <a
              className='no-underline'
              href='https://healthequitytracker.org/exploredata?mls=1.frequent_mental_distress-3.00&group1=All'
            >
              frequent mental distress
            </a>
          </li>
          <li className='font-sansTitle font-medium'>
            <a
              className='no-underline'
              href='https://healthequitytracker.org/exploredata?mls=1.depression-3.00&group1=All'
            >
              depression
            </a>
          </li>
          <li className='font-sansTitle font-medium'>
            <a
              className='no-underline'
              href='https://healthequitytracker.org/exploredata?mls=1.excessive_drinking-3.00&group1=All'
            >
              excessive drinking
            </a>
          </li>
        </ul>

        <p>
          AHR usually gives us rates as percentages. In some cases, they provide
          the number of cases for every 100,000 people. We keep the data in the
          format AHR provides it. If we need to change a percentage into a{' '}
          {totalCasesPer100kPeopleTooltip} rate, we simply multiply the
          percentage by 1,000. For example, a 5% rate would become 5,000 per
          100,000 people.
        </p>
        <CodeBlock
          rowData={[
            {
              content: '5% rate (of 100)',
            },
            {
              content: '===',
            },
            {
              content: (
                <>
                  <b>5,000 per 100,000 people</b>
                </>
              ),
            },
          ]}
        />
        <Alert severity='info' role='note'>
          <AlertTitle>
            A note about the America's Health Rankings (AHR)'s population data
          </AlertTitle>
          <p>
            Without population data, it is difficult to accurately calculate{' '}
            {percentShareTooltip} measures, which could potentially result in
            misleading data.{' '}
          </p>
          <p>
            We don't display percent share figures for certain health measures
            because the original data source only gives us these numbers as{' '}
            {
              <DefinitionTooltip
                topic={'rates'}
                definitionItem={definitionsGlossary[40]}
              />
            }
            , and not as a portion of the population.
          </p>
          <p>
            Please note that AHR does not provide population-specific data for
            certain conditions, including:
            <ul>
              <li className='font-sansTitle font-medium'>
                <a
                  className='no-underline'
                  href='https://healthequitytracker.org/exploredata?mls=1.substance-3.00&group1=All'
                >
                  non-medical drug use
                </a>
                .
              </li>
            </ul>
            However, we encourage you to explore our comprehensive reports for
            valuable insights into these and other conditions.
          </p>
        </Alert>
        <h3
          className='font-sansTitle text-title'
          id='#behavioral-health-data-sources'
        >
          Data Sources
        </h3>
        <StripedTable
          applyThickBorder={false}
          columns={[
            { header: 'Source', accessor: 'source' },
            { header: 'Geographic Level', accessor: 'geo' },
            { header: 'Granularity', accessor: 'granularity' },
            { header: 'Update Frequency', accessor: 'updates' },
          ]}
          rows={behavioralHealthDataSources.map((source, index) => ({
            source: (
              <a
                key={index}
                href={`${DATA_CATALOG_PAGE_LINK}?${DATA_SOURCE_PRE_FILTERS}=${source.id}`}
              >
                {source.data_source_name}
              </a>
            ),
            geo: source.geographic_level,
            granularity: source.demographic_granularity,
            updates: source.update_frequency,
          }))}
        />
        <KeyTerms
          id='#behavioral-health-key-terms'
          definitionsArray={behavioralHealthDefinitionsArray}
        />

        <LifelineAlert />
        <Resources
          id='#behavioral-health-resources'
          resourceGroups={[MENTAL_HEALTH_RESOURCES]}
        />
      </article>
    </section>
  )
}

export default BehavioralHealthLink
