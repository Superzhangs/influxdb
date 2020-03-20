// Libraries
import React, {PureComponent} from 'react'
import {withRouter, WithRouterProps, Link} from 'react-router'
import {connect} from 'react-redux'
import {get} from 'lodash'

// Components
import {Icon, TreeNav} from '@influxdata/clockface'
import UserWidget from 'src/pageLayout/components/UserWidget'
import NavHeader from 'src/pageLayout/components/NavHeader'
import CloudExclude from 'src/shared/components/cloud/CloudExclude'
import CloudOnly from 'src/shared/components/cloud/CloudOnly'
import {FeatureFlag} from 'src/shared/utils/featureFlag'

// Constants
import {generateNavItems} from 'src/pageLayout/constants/navigationHierarchy'

// Utils
import {getNavItemActivation} from 'src/pageLayout/utils'

// Types
import {AppState, NavBarState} from 'src/types'

// Actions
import {setNavBarState} from 'src/shared/actions/app'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

interface StateProps {
  isHidden: boolean
  navBarState: NavBarState
}

interface DispatchProps {
  handleSetNavBarState: typeof setNavBarState
}

interface State {
  isShowingOrganizations: boolean
}

type Props = StateProps & DispatchProps & WithRouterProps

@ErrorHandling
class SideNav extends PureComponent<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      isShowingOrganizations: false,
    }
  }

  public render() {
    const {
      isHidden,
      params: {orgID},
      navBarState,
      handleSetNavBarState,
    } = this.props

    if (isHidden) {
      return null
    }

    const handleToggleNavExpansion = (): void => {
      if (navBarState === 'expanded') {
        handleSetNavBarState('collapsed')
      } else {
        handleSetNavBarState('expanded')
      }
    }

    const orgPrefix = `/orgs/${orgID}`
    const navItems = generateNavItems(orgID)

    return (
      <TreeNav
        expanded={navBarState === 'expanded'}
        headerElement={<NavHeader link={orgPrefix} />}
        userElement={<UserWidget />}
        onToggleClick={handleToggleNavExpansion}
      >
        {navItems.map(item => {
          let navItemElement = (
            <TreeNav.Item
              key={item.id}
              id={item.id}
              testID={item.testID}
              icon={<Icon glyph={item.icon} />}
              label={item.label}
              shortLabel={item.shortLabel}
              active={getNavItemActivation(
                item.activeKeywords,
                location.pathname
              )}
              linkElement={className => (
                <Link className={className} to={item.link} />
              )}
            >
              {!!item.menu ? (
                <TreeNav.SubMenu>
                  {item.menu.map(menuItem => {
                    let navSubItemElement = (
                      <TreeNav.SubItem
                        key={menuItem.id}
                        id={menuItem.id}
                        testID={menuItem.testID}
                        active={getNavItemActivation(
                          [menuItem.id],
                          location.pathname
                        )}
                        label={menuItem.label}
                        linkElement={className => (
                          <Link className={className} to={menuItem.link} />
                        )}
                      />
                    )

                    if (menuItem.cloudExclude) {
                      navSubItemElement = (
                        <CloudExclude key={menuItem.id}>
                          {navSubItemElement}
                        </CloudExclude>
                      )
                    }

                    if (menuItem.cloudOnly) {
                      navSubItemElement = (
                        <CloudOnly key={menuItem.id}>
                          {navSubItemElement}
                        </CloudOnly>
                      )
                    }

                    if (menuItem.featureFlag) {
                      navSubItemElement = (
                        <FeatureFlag
                          key={menuItem.id}
                          name={menuItem.featureFlag}
                        >
                          {navSubItemElement}
                        </FeatureFlag>
                      )
                    }

                    return navSubItemElement
                  })}
                </TreeNav.SubMenu>
              ) : null}
            </TreeNav.Item>
          )

          if (item.cloudExclude) {
            navItemElement = (
              <CloudExclude key={item.id}>{navItemElement}</CloudExclude>
            )
          }

          if (item.cloudOnly) {
            navItemElement = (
              <CloudOnly key={item.id}>{navItemElement}</CloudOnly>
            )
          }

          if (item.featureFlag) {
            navItemElement = (
              <FeatureFlag key={item.id} name={item.featureFlag}>
                {navItemElement}
              </FeatureFlag>
            )
          }

          return navItemElement
        })}
      </TreeNav>
    )
  }
}

const mdtp: DispatchProps = {
  handleSetNavBarState: setNavBarState,
}

const mstp = (state: AppState): StateProps => {
  const isHidden = get(state, 'app.ephemeral.inPresentationMode', false)
  const navBarState = get(state, 'app.persisted.navBarState', 'collapsed')

  return {isHidden, navBarState}
}

export default connect<StateProps, DispatchProps>(
  mstp,
  mdtp
)(withRouter(SideNav))