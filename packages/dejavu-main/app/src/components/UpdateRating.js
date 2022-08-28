// @flow

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
	FlashMessage as ErrorFlashMessage,
	ConnectApp,
	appReducers,
	utils,
} from '@appbaseio/dejavu-browser';

import BaseContainer from '../batteries/components/BaseContainer';
import { TextInput } from '../batteries/components/shared/Input';
import { Alert, Button, Col, Form, Row, Typography } from 'antd';

const { getIsConnected, getAppname, getUrl } = appReducers;
const { parseUrl } = utils;

type Props = {
	isConnected: boolean,
	appName?: string,
	rawUrl?: string,
};

const UpdateRating = ({ isConnected, appName, rawUrl }: Props) => {
	const { url } = parseUrl(rawUrl);
	const [apiKey, setApiKey] = useState();
	const [contractId, setContractId] = useState();
	const [responseError, setResponseError] = useState();
	const [loading, setLoading] = useState(false);

	const submitForRating = () => {
		setLoading(true);
		// check fields
		// ajax call
		setResponseError('test');
	};

	return (
		<section>
			<ErrorFlashMessage />
			<ConnectApp />
			{isConnected && (
				<BaseContainer
					appName={appName}
					shouldFetchAppPlan={false}
					shouldFetchAppInfo={false}
					url={url}
				>
					<section style={{ padding: '20px' }}>
						<Row>
							<Col span={12} offset={6}>
								<Typography.Title level={3}>
									Update A Collection's Rating
								</Typography.Title>

								<Form.Item
									label={'API Key'}
									colon={false}
									key={'api-key'}
								>
									<TextInput
										name={'API Key'}
										placeholder={'Enter API Key'}
										value={''}
										handleChange={setApiKey}
									/>
								</Form.Item>

								<Form.Item
									label={'Collection ID'}
									colon={false}
									key={'collection-id'}
								>
									<TextInput
										name={'Collection ID'}
										placeholder={'Enter Collection ID'}
										value={''}
										handleChange={setContractId}
									/>
								</Form.Item>

								<Button
									size="large"
									className="dejavu-browser-btn-primary"
									loading={loading}
									onClick={submitForRating}
								>
									Submit
								</Button>

								{responseError && (
									<Alert
										style={{ 'margin-top': '10px' }}
										message="Error"
										description={responseError}
										type="error"
										closable
										onClose={() => setResponseError(false)}
									/>
								)}
							</Col>
						</Row>
					</section>
				</BaseContainer>
			)}
		</section>
	);
};

const mapStateToProps = state => ({
	isConnected: getIsConnected(state),
	appName: getAppname(state),
	rawUrl: getUrl(state),
});

export default connect(mapStateToProps)(UpdateRating);
