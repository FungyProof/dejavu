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
import { Alert, Button, Col, Form, Input, Modal, Row, Typography } from 'antd';

const { getIsConnected, getAppname, getUrl } = appReducers;
const { parseUrl } = utils;

const IndexCollection = ({ isConnected, appName, rawUrl }) => {
	const { url } = parseUrl(rawUrl);
	const [apiKey, setApiKey] = useState();
	const [contractId, setContractId] = useState();
	const [response, setResponse] = useState();
	const [status, setStatus] = useState();
	const [modalOpen, setModalOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const checkStatus = async () => {
		try {
			const res = await fetch(
				`http://localhost:3000/v0/jobs/index-contract/${contractId}/status`,
				{
					headers: {
						'X-Api-Key': apiKey,
						'Content-Type': 'application/json',
					},
					method: 'GET',
				},
			).then(response => response.json());

			if (res.statusCode >= 400) {
				setResponse({ type: 'error', message: res.message });
			} else {
				res.results = res.results.reverse();
				setStatus(res);
				setModalOpen(true);
			}
		} catch (err) {
			setResponse({ type: 'error', message: err.message });
		}
	};

	const submitForIndexing = async () => {
		if (!contractId || !apiKey) return;
		setLoading(true);

		const [chainId, address] = contractId.split(':');

		try {
			await fetch(
				`http://localhost:3000/v0/jobs/index-contract/${contractId}`,
				{
					headers: {
						'X-Api-Key': apiKey,
					},
					method: 'DELETE',
				},
			);
		} catch {}

		try {
			const res = await fetch(
				'http://localhost:3000/v0/jobs/index-contract',
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
					message: 'Collection queued for indexing',
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
								Index Collection
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

							<Typography.Text
								type="warning"
								style={{ margin: '20px 0', display: 'block' }}
							>
								WARNING: if a collection is already indexed any
								data which has been manually updated will be
								overridden.
							</Typography.Text>

							<Button
								size="large"
								type="primary"
								loading={loading}
								onClick={submitForIndexing}
							>
								Submit
							</Button>

							{contractId && apiKey && (
								<Button
									size="large"
									onClick={checkStatus}
									style={{ marginLeft: '6px' }}
								>
									Check Status
								</Button>
							)}

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
			<Modal
				visible={modalOpen}
				onCancel={() => setModalOpen(false)}
				onOk={() => setModalOpen(false)}
				maskClosable={false}
				destroyOnClose
				title="Collection Indexing Status"
				css={{ top: 10 }}
				closable={false}
			>
				<div
					css={{
						maxHeight: '500px',
						overflow: 'auto',
						paddingRight: 10,
					}}
				>
					<pre>{JSON.stringify(status, null, 2)}</pre>
				</div>
			</Modal>
		</section>
	);
};

const mapStateToProps = state => ({
	isConnected: getIsConnected(state),
	appName: getAppname(state),
	rawUrl: getUrl(state),
});

export default connect(mapStateToProps)(IndexCollection);
