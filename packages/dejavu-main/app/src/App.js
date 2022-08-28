import React, { Component, lazy, Suspense } from 'react';
import { Layout, Modal, Skeleton } from 'antd';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { mediaMin } from '@divyanshu013/media';
import {
	Flex,
	utils,
	constants,
	store,
	colors,
} from '@appbaseio/dejavu-browser';

import Navigation from './components/Navigation';
import NoMatch from './components/NoMatch';

import logo from './images/logo.svg';

const SearchPreview = lazy(() => import('./components/SearchPreview'));
const DataBrowser = lazy(() => import('@appbaseio/dejavu-browser'));
const QueryExplorer = lazy(() => import('./components/QueryExplorer'));
const UpdateRating = lazy(() => import('./components/UpdateRating'));
const IndexCollection = lazy(() => import('./components/IndexCollection'));

const { getUrlParams, getLocalStorageItem, setLocalStorageData } = utils;
const { LOCAL_CONNECTIONS } = constants;

const { Content, Sider } = Layout;

function withSuspense(ChildComponent, props) {
	return (
		<Suspense fallback={<Skeleton />}>
			<ChildComponent {...props} />
		</Suspense>
	);
}

class App extends Component {
	state = {
		isShowingSideBar: true,
		isShowingFooter: true,
		isShowingVideo: false,
	};

	componentDidMount() {
		const { sidebar, footer } = getUrlParams(window.location.search);

		if (sidebar && sidebar === 'false') {
			this.setSideBarVisibility(false);
		}

		if (footer && footer === 'false') {
			this.setFooterVisibility(false);
		}

		const localConnections = getLocalStorageItem(LOCAL_CONNECTIONS);

		if (!localConnections) {
			setLocalStorageData(
				LOCAL_CONNECTIONS,
				JSON.stringify({
					pastApps: [],
				}),
			);
		}
	}

	setSideBarVisibility = isShowingSideBar => {
		this.setState({
			isShowingSideBar,
		});
	};

	setFooterVisibility = isShowingFooter => {
		this.setState({
			isShowingFooter,
		});
	};

	showVideoModal = () => {
		this.setState({
			isShowingVideo: true,
		});
	};

	hideVideoModal = () => {
		this.setState({
			isShowingVideo: false,
		});
	};

	renderExtensionRoutes = () => {
		const { route } = getUrlParams(window.location.search);

		if (route) {
			if (route === 'preview') {
				return withSuspense(SearchPreview);
			}

			if (route === 'update-rating') {
				return withSuspense(UpdateRating);
			}

			if (route === 'index-collection') {
				return withSuspense(IndexCollection);
			}

			if (route === 'query') {
				return withSuspense(QueryExplorer);
			}

			return withSuspense(DataBrowser);
		}

		return withSuspense(DataBrowser);
	};

	render() {
		const {
			isShowingSideBar,
			isShowingFooter,
			isShowingVideo,
		} = this.state;
		return (
			<Provider store={store}>
				<BrowserRouter>
					<Layout
						css={{ minHeight: isShowingSideBar ? '100vh' : 'auto' }}
					>
						{isShowingSideBar && (
							<Sider
								theme="light"
								css={{
									display: 'none',
									[mediaMin.medium]: {
										display: 'block',
									},
								}}
							>
								<img
									src={logo}
									alt="Dejavu"
									width="100%"
									css={{ padding: 25 }}
								/>
								<Navigation />
							</Sider>
						)}
						<Layout css={{ overflowX: 'hidden !important' }}>
							<Content
								css={{
									margin: isShowingSideBar ? '15px 25px' : 0,
									height: isShowingFooter ? '95%' : '100%',
								}}
							>
								<div
									css={{
										padding: 20,
										background: '#fff',
									}}
								>
									<Switch>
										<Route
											exact
											path="/"
											render={props =>
												withSuspense(DataBrowser, props)
											}
										/>
										<Route
											exact
											path="/index-collection"
											render={props =>
												withSuspense(IndexCollection, props)
											}
										/>
										<Route
											exact
											path="/update-rating"
											render={props =>
												withSuspense(UpdateRating, props)
											}
										/>
										<Route
											path="/preview"
											render={props =>
												withSuspense(
													SearchPreview,
													props,
												)
											}
										/>
										<Route
											path="/query"
											render={props =>
												withSuspense(
													QueryExplorer,
													props,
												)
											}
										/>
										<Route
											path="/browse"
											render={() => (
												<Redirect
													to={{
														pathname: '/',
														search:
															window.location
																.search,
													}}
												/>
											)}
										/>
										{/* Special cases for chrome extension */}
										<Route
											path="/index.html"
											render={this.renderExtensionRoutes}
										/>
										<Route
											path="/404"
											component={NoMatch}
										/>
										<Route component={NoMatch} />
									</Switch>
								</div>
							</Content>
						</Layout>
					</Layout>
				</BrowserRouter>
			</Provider>
		);
	}
}

export default App;
