import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { useEffect, useState, lazy } from 'react'
import { STATUS } from 'react-joyride'
import Carousel from 'react-material-ui-carousel'
import ReportProvider from '../../reports/ReportProvider'
import {
  getMadLibPhraseText,
  getSelectedConditions,
  type MadLib,
  MADLIB_LIST,
  type PhraseSegment,
  type PhraseSelections,
} from '../../utils/MadLibs'
import {
  DATA_TYPE_1_PARAM,
  DEMOGRAPHIC_PARAM,
  getParameter,
  MADLIB_PHRASE_PARAM,
  MADLIB_SELECTIONS_PARAM,
  parseMls,
  psSubscribe,
  setParameter,
  setParameters,
  SHOW_ONBOARDING_PARAM,
  stringifyMls,
} from '../../utils/urlutils'
import styles from './ExploreDataPage.module.scss'
import { srSpeak } from '../../utils/a11yutils'
import { urlMap } from '../../utils/externalUrls'
import { type VariableConfig } from '../../data/config/MetricConfig'
import { INCARCERATION_IDS } from '../../data/variables/IncarcerationProvider'
import useScrollPosition from '../../utils/hooks/useScrollPosition'
import { useHeaderScrollMargin } from '../../utils/hooks/useHeaderScrollMargin'
import { useLocation } from 'react-router-dom'
import CarouselMadLib from './CarouselMadlib'
import sass from '../../styles/variables.module.scss'
import DefaultHelperBox from './DefaultHelperBox'
import useDeprecatedParamRedirects from '../../utils/hooks/useDeprecatedParamRedirects'

const Onboarding = lazy(async () => await import('./Onboarding'))

const EXPLORE_DATA_ID = 'main'

export interface ExploreDataPageProps {
  isMobile: boolean
}

function ExploreDataPage(props: ExploreDataPageProps) {
  const location: any = useLocation()
  const [showStickyLifeline, setShowStickyLifeline] = useState(false)
  const [showIncarceratedChildrenAlert, setShowIncarceratedChildrenAlert] =
    useState(false)

  // Set up initial mad lib values based on defaults and query params, redirecting from deprecated ones
  const params = useDeprecatedParamRedirects()

  // swap out old variable ids for backwards compatibility of outside links
  const foundIndex = MADLIB_LIST.findIndex(
    (madlib) => madlib.id === params[MADLIB_PHRASE_PARAM]
  )
  const initialIndex = foundIndex !== -1 ? foundIndex : 0
  const defaultValuesWithOverrides = MADLIB_LIST[initialIndex].defaultSelections
  if (params[MADLIB_SELECTIONS_PARAM]) {
    params[MADLIB_SELECTIONS_PARAM].split(',').forEach((override) => {
      const [phraseSegmentIndex, value] = override.split(':')
      const phraseSegments: PhraseSegment[] = MADLIB_LIST[initialIndex].phrase
      if (
        Object.keys(phraseSegments).includes(phraseSegmentIndex) &&
        Object.keys(phraseSegments[Number(phraseSegmentIndex)]).includes(value)
      ) {
        defaultValuesWithOverrides[Number(phraseSegmentIndex)] = value
      }
    })
  }

  const [madLib, setMadLib] = useState<MadLib>({
    ...MADLIB_LIST[initialIndex],
    activeSelections: defaultValuesWithOverrides,
  })

  const noTopicChosen = getSelectedConditions(madLib)?.length === 0

  useEffect(() => {
    const readParams = () => {
      const index = getParameter(MADLIB_PHRASE_PARAM, 0, (str) => {
        return MADLIB_LIST.findIndex((ele) => ele.id === str)
      })
      const selection = getParameter(
        MADLIB_SELECTIONS_PARAM,
        MADLIB_LIST[index].defaultSelections,
        parseMls
      )

      setMadLib({
        ...MADLIB_LIST[index],
        activeSelections: selection,
      })
    }
    const psSub = psSubscribe(readParams, 'explore')

    readParams()

    return () => {
      if (psSub) {
        psSub.unsubscribe()
      }
    }
  }, [])

  const setMadLibWithParam = (ml: MadLib) => {
    setParameters([
      {
        name: MADLIB_SELECTIONS_PARAM,
        value: stringifyMls(ml.activeSelections),
      },
      { name: DATA_TYPE_1_PARAM, value: null },
      { name: DEMOGRAPHIC_PARAM, value: null },
    ])
    setMadLib(ml)
  }

  // Set up warm welcome onboarding behaviors
  let showOnboarding = false
  if (noTopicChosen) {
    if (params?.[SHOW_ONBOARDING_PARAM] === 'true') {
      showOnboarding = true
    }
    if (params?.[SHOW_ONBOARDING_PARAM] === 'false') {
      showOnboarding = false
    }
  }

  // if there is an incoming #hash; bypass the warm welcome entirely
  if (location.hash !== '') showOnboarding = false

  const [activelyOnboarding, setActivelyOnboarding] =
    useState<boolean>(showOnboarding)
  const onboardingCallback = (data: any) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
      setActivelyOnboarding(false)
      setParameter(SHOW_ONBOARDING_PARAM, 'false')
    }
  }

  // Set up sticky madlib behavior
  const [isSticking, setIsSticking] = useState<boolean>(false)
  useScrollPosition(
    ({ pageYOffset, stickyBarOffsetFromTop }) => {
      const topOfCarousel = pageYOffset > stickyBarOffsetFromTop
      if (topOfCarousel) setIsSticking(true)
      else setIsSticking(false)
    },
    [isSticking],
    300
  )

  // calculate page size to determine if mobile or not
  const isSingleColumn = madLib.id === 'disparity'
  const handleCarouselChange = (now?: number) => {
    if (now == null) return

    // Extract values from the current madlib
    const var1 = madLib.activeSelections[1]
    const geo1 =
      madLib.id === 'comparevars'
        ? madLib.activeSelections[5]
        : madLib.activeSelections[3]

    // default non-duplicate settings for compare modes
    const var2 = var1 === 'covid_cases' ? 'covid_vaccinations' : 'covid_cases'
    const geo2 = geo1 === '00' ? '13' : '00' // default to US or Georgia

    // Construct UPDATED madlib based on the future carousel Madlib shape
    let updatedMadLib: PhraseSelections = { 1: var1, 3: geo1 } // disparity "Investigate Rates"
    if (now === 1) updatedMadLib = { 1: var1, 3: geo1, 5: geo2 } // comparegeos "Compare Rates"
    if (now === 2) updatedMadLib = { 1: var1, 3: var2, 5: geo1 } // comparevars "Explore Relationships"

    setMadLib({
      ...MADLIB_LIST[now],
      activeSelections: updatedMadLib,
    })
    setParameters([
      {
        name: MADLIB_SELECTIONS_PARAM,
        value: stringifyMls(updatedMadLib),
      },
      {
        name: MADLIB_PHRASE_PARAM,
        value: MADLIB_LIST[now].id,
      },
    ])
    location.hash = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* on any changes to the madlib settings */
  useEffect(() => {
    // A11y - create then delete an invisible alert that the report mode has changed
    srSpeak(`Now viewing report: ${getMadLibPhraseText(madLib)}`)

    // hide/display the sticky suicide lifeline link based on selected condition
    setShowStickyLifeline(
      getSelectedConditions(madLib)?.some(
        (condition: VariableConfig) => condition?.variableId === 'suicide'
      )
    )

    setShowIncarceratedChildrenAlert(
      getSelectedConditions(madLib)?.some((condition: VariableConfig) =>
        INCARCERATION_IDS.includes(condition?.variableId)
      )
    )
  }, [madLib])

  const headerScrollMargin = useHeaderScrollMargin(
    'madlib-carousel-container',
    isSticking,
    [madLib, showIncarceratedChildrenAlert, showStickyLifeline]
  )

  return (
    <>
      <Onboarding
        callback={onboardingCallback}
        activelyOnboarding={activelyOnboarding}
      />

      <h2 className={styles.ScreenreaderTitleHeader}>
        {getMadLibPhraseText(madLib)}
      </h2>
      <div id={EXPLORE_DATA_ID} tabIndex={-1} className={styles.ExploreData}>
        <div
          className={styles.CarouselContainer}
          id="madlib-carousel-container"
        >
          <Carousel
            className={`Carousel ${styles.Carousel}`}
            swipe={false}
            NextIcon={<NavigateNextIcon id="onboarding-madlib-arrow" />}
            autoPlay={false}
            indicators={false}
            indicatorIconButtonProps={{
              'aria-label': 'Report Type',
              style: {
                padding: '4px',
                color: sass.altGrey,
              },
            }}
            activeIndicatorIconButtonProps={{
              'aria-label': 'Current Selection: Report Type',
              style: {
                padding: '4px',
                color: sass.altGreen,
              },
            }}
            // ! TODO We really should be able to indicate Forward/Backward vs just "Change"
            navButtonsProps={{
              'aria-label': 'Change Report Type',
              style: {
                border: `1px solid ${sass.altGreen}`,
                backgroundColor: sass.white,
                color: sass.altGreen,
                borderRadius: 100,
                boxShadow:
                  '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
              },
            }}
            animation="slide"
            duration={700}
            navButtonsAlwaysVisible={true}
            cycleNavigation={false}
            navButtonsAlwaysInvisible={noTopicChosen}
            index={initialIndex}
            onChange={(nowIndex) => {
              handleCarouselChange(nowIndex)
            }}
          >
            {/* carousel settings same length as MADLIB_LIST, but fill each with madlib constructed earlier */}
            {MADLIB_LIST.map((madLibShape) => (
              <CarouselMadLib
                madLib={madLib}
                setMadLib={setMadLibWithParam}
                key={madLibShape.id}
              />
            ))}
          </Carousel>
          {showStickyLifeline && (
            <p className={styles.LifelineSticky}>
              <a href={urlMap.lifeline}>988lifeline.org</a>
            </p>
          )}
        </div>
        <div className={styles.ReportContainer}>
          {noTopicChosen ? (
            <DefaultHelperBox />
          ) : (
            <ReportProvider
              isSingleColumn={isSingleColumn}
              madLib={madLib}
              selectedConditions={getSelectedConditions(madLib)}
              showLifeLineAlert={showStickyLifeline}
              showIncarceratedChildrenAlert={showIncarceratedChildrenAlert}
              setMadLib={setMadLibWithParam}
              isScrolledToTop={!isSticking}
              headerScrollMargin={headerScrollMargin}
              isMobile={props.isMobile}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default ExploreDataPage
