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
import { Alert, Button, Col, Form, Input, Row, Typography } from 'antd';

const { getIsConnected, getAppname, getUrl } = appReducers;
const { parseUrl } = utils;

const UpdateRating = ({ isConnected, appName, rawUrl }) => {
	const { url } = parseUrl(rawUrl);
	const [apiKey, setApiKey] = useState();
	const [contractId, setContractId] = useState();
	const [response, setResponse] = useState();
	const [loading, setLoading] = useState(false);

	const submitForRating = async () => {
		if (!contractId || !apiKey) return;
		setLoading(true);

		const [chainId, address] = contractId.split(':');

		try {
			const res = await fetch(
				'https://api.skry.xyz/v0/jobs/update-rating',
				{
					headers: {
						'X-Api-Key': apiKey,
						'Content-Type': 'application/json',
					},
					method: 'POST',
					body: JSON.stringify({ chainId, address }),
				},
			).then(response => response.json());

			if (res.statusCode >= 400) {
				setResponse({ type: 'error', message: res.message });
			} else {
				setResponse({
					type: 'success',
					message: 'Collection rating update queued',
				});
			}
		} catch (err) {
			setResponse({ type: 'error', message: err.message });
		}
		setLoading(false);
	};

	return (
		<section>
			<ErrorFlashMessage />
			{/* <ConnectApp /> */}

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
								Update Collection Rating
							</Typography.Title>

							<Form.Item
								label={'API Key'}
								colon={false}
								key={'api-key'}
							>
								<Input.Password
									name="apiKey"
									placeholder={'Enter API Key'}
									onChange={e => setApiKey(e.target.value)}
								/>
							</Form.Item>

							<Form.Item
								label={'Collection ID'}
								colon={false}
								key={'collection-id'}
							>
								<TextInput
									name="contractId"
									placeholder={
										'Enter Collection ID as "{chain id}:{contract address}"'
									}
									handleChange={v =>
										setContractId(v.contractId)
									}
								/>
							</Form.Item>

							<Button
								type="primary"
								size="large"
								className="dejavu-browser-btn-primary"
								loading={loading}
								onClick={submitForRating}
							>
								Submit
							</Button>

							{response && (
								<Alert
									style={{ marginTop: '10px' }}
									description={response.message}
									type={response.type}
									closable
									onClose={() => setResponse(null)}
								/>
							)}
						</Col>
					</Row>
				</section>
			</BaseContainer>
		</section>
	);
};

const mapStateToProps = state => ({
	isConnected: getIsConnected(state),
	appName: getAppname(state),
	rawUrl: getUrl(state),
});

export default connect(mapStateToProps)(UpdateRating);
