<script lang="ts">
	import type { SnackbarComponentDev } from '@smui/snackbar';
	import Snackbar, { Actions as SnackbarActions, Label as SnackbarLabel } from '@smui/snackbar';
	import Dialog, {
		Title as DialogTitle,
		Content as DialogContent,
		Actions as DialogActions,
		Header as DialogHeader
	} from '@smui/dialog';
	import CircularProgress from '@smui/circular-progress';
	import IconButton from '@smui/icon-button';
	import List, { Item, Text, Separator, PrimaryText, SecondaryText, Meta } from '@smui/list';
	import Paper, { Title, Content } from '@smui/paper';
	import TextField from '@smui/textfield';
	import Button, { Label } from '@smui/button';
	import Radio from '@smui/radio';
	import FormField from '@smui/form-field';
	import { PUB_API_PATH } from '$env/static/public';
	import ky, { HTTPError } from 'ky';

	let snackbar: SnackbarComponentDev;
	let snackbarClass: 'success' | 'warning' | 'error' = 'success';
	let snackbarMsg = '';
	let snackbarCount = 0;

	function pop(s: SnackbarComponentDev, c: 'success' | 'warning' | 'error', msg: string) {
		if (!s) {
			return;
		}
		if (s.isOpen()) {
			s.close();
		}
		snackbarMsg = msg;
		snackbarClass = c;
		s.open();
		let count = ++snackbarCount;
		setTimeout(() => {
			if (snackbarCount === count && s.isOpen()) {
				s.close();
			}
		}, 5000);
	}

	const httpClient = ky.create({
		prefixUrl: PUB_API_PATH || undefined
	});

	const TypeChoices = [1, 2, 3];

	function CodeToType(code: number): string {
		switch (code) {
			case 1:
				return 'Work';
			case 2:
				return 'Travel';
			case 3:
				return 'Shopping';
			default:
				return '';
		}
	}

	let clicked = 0;
	$: clickedWord = CodeToType(clicked);
	$: svelteHead = clickedWord || (clicked == 0 && 'Create') || 'TODO';

	// LIST TODO

	interface TodoEntity {
		id: number;
		creatorName: string;
		text: string;
		todoType: number;
	}

	let todoList: TodoEntity[] = [];

	async function handleLists(i: number) {
		// await new Promise((r) => setTimeout(r, 2000));
		// todoList = [
		// 	{ id: 1, creatorName: 'rew', text: 'rewrew', todoType: 2 },
		// 	{ id: 1, creatorName: 'rew2', text: 'rewrew2', todoType: 2 }
		// ];
		// return;
		try {
			const res = await httpClient.get('todo', {
				searchParams: {
					todo_type: i
				}
			});
			todoList = await res.json();
		} catch (error) {
			if (error instanceof HTTPError) {
				const res = error.response;
				error = `${res.status}: ${await res.text()}`;
			}
			throw error;
		}
	}

	async function handleRemove(i: number) {
		const oldClicked = clicked;
		clicked = -1;
		// await new Promise((r) => setTimeout(r, 2000));
		try {
			const res = await httpClient.delete(`todo/${encodeURIComponent(i)}`);
			const resText = await res.text();
			const snackMsg = res.statusText + '\n' + resText;
			pop(snackbar, 'success', snackMsg);
		} catch (error) {
			if (error instanceof HTTPError) {
				const res = error.response;
				error = `${res.status}: ${await res.text()}`;
			}
			pop(snackbar, 'error', '' + error);
			if (clicked === -1) {
				clicked = oldClicked;
			}
			throw error;
		}
		if (clicked === -1) {
			clicked = oldClicked;
		}
	}

	// EDIT DIALOG

	let dialogOpen = false;
	let editedIndex = 0;
	$: toBeEdited = todoList?.at(editedIndex);
	let editingText = '';

	function handleOpenDialog() {
		editingText = toBeEdited?.text ?? '';
		dialogOpen = true;
	}

	async function handleEditText() {
		const oldClicked = clicked;
		clicked = -1;
		// await new Promise((r) => setTimeout(r, 2000));
		try {
			const i = toBeEdited?.id;
			if (i === undefined) {
				throw `id ${i} not correct`;
			}
			const res = await httpClient.patch(`todo/${encodeURIComponent(i)}`, {
				json: {
					text: editingText
				}
			});
			const resText = await res.text();
			const snackMsg = res.statusText + '\n' + resText;
			pop(snackbar, 'success', snackMsg);
		} catch (error) {
			if (error instanceof HTTPError) {
				const res = error.response;
				error = `${res.status}: ${await res.text()}`;
			}
			pop(snackbar, 'error', '' + error);
			if (clicked === -1) {
				clicked = oldClicked;
			}
			throw error;
		}
		if (clicked === -1) {
			clicked = oldClicked;
		}
	}

	// CREATE TODO

	let creatorName = '';
	let text = '';
	let type = 1;

	async function handleCreateTodo() {
		const oldClicked = clicked;
		clicked = -1;
		// await new Promise((r) => setTimeout(r, 2000));
		try {
			const res = await httpClient.post('todo', {
				json: {
					creatorName,
					text,
					todoType: type
				}
			});
			const snackMsg = res.statusText + '\n' + (await res.text());
			pop(snackbar, 'success', snackMsg);
			if (clicked === -1) {
				clicked = type;
			}
		} catch (error) {
			if (error instanceof HTTPError) {
				const res = error.response;
				error = `${res.status}: ${await res.text()}`;
			}
			pop(snackbar, 'error', '' + error);
			if (clicked === -1) {
				clicked = oldClicked;
			}
		}
	}
</script>

<svelte:head>
	<title>{svelteHead}</title>
</svelte:head>

<Snackbar bind:this={snackbar} class={snackbarClass}>
	<SnackbarLabel>{snackbarMsg}</SnackbarLabel>
	<SnackbarActions>
		<IconButton class="material-icons" title="Dismiss">cancel</IconButton>
	</SnackbarActions>
</Snackbar>

<Dialog bind:open={dialogOpen} fullscreen>
	<DialogHeader>
		<DialogTitle>Edit Text</DialogTitle>
	</DialogHeader>
	<DialogContent>
		Editing row {editedIndex}
		<TextField
			variant="outlined"
			style="width: 100%; margin: 15px 0px"
			bind:value={editingText}
			label={`${toBeEdited?.creatorName ?? ''} will modify this in the todo id#${toBeEdited?.id}`}
		/>
	</DialogContent>
	<DialogActions>
		<Button on:click={handleEditText}>Submit</Button>
	</DialogActions>
</Dialog>

<div class="container">
	<div class="menu-list item">
		<List>
			{#each TypeChoices as i}
				<Item
					selected={clicked === i}
					on:SMUI:action={() => {
						clicked = i;
						todoList = [];
					}}><Text>{CodeToType(i)}</Text></Item
				>
			{/each}
			<Separator />
			<Item selected={clicked === 0} on:SMUI:action={() => (clicked = 0)}><Text>Create</Text></Item>
		</List>
	</div>
	{#if clicked > 0 && clicked <= 3}
		<div class="paper item">
			<Paper>
				<Title>{clickedWord}</Title>
				<Content>
					{#await handleLists(clicked)}
						<div style="display: flex; justify-content: center">
							<CircularProgress style="height: 32px; width: 32px;" indeterminate />
						</div>
					{:then _}
						<List twoLine bind:selectedIndex={editedIndex}>
							{#each todoList as item}
								<Separator />
								<Item on:SMUI:action={handleOpenDialog}>
									<Text>
										<PrimaryText>{item.text}</PrimaryText>
										<SecondaryText
											>{CodeToType(
												item.todoType
											)}{':'}{item.id}{'# '}{item.creatorName}</SecondaryText
										>
									</Text>
									<Meta
										><IconButton class="material-icons" on:click={() => handleRemove(item.id)}>
											cancel
										</IconButton></Meta
									>
								</Item>
							{/each}
							<Separator />
						</List>
					{:catch err}
						{'' + err}
					{/await}
				</Content>
			</Paper>
		</div>
	{:else if clicked == 0}
		<div class="paper item">
			<Paper>
				<Title>Create new Item</Title>
				<Content>
					<div style="margin-bottom: 15px">
						<pre style="display: inline-block; padding-right: 15px">From:</pre>
						<TextField bind:value={creatorName} label="Creator Name" />
						<div>
							{#each TypeChoices as i}
								<FormField>
									<Radio bind:group={type} value={i} />
									<span slot="label">{CodeToType(i)}</span>
								</FormField>
							{/each}
						</div>
					</div>
					<TextField
						variant="outlined"
						style="width: 100%; margin-bottom: 15px"
						bind:value={text}
						label="To-do Item"
					/>
					<Button on:click={handleCreateTodo}>
						<Label>Submit</Label>
					</Button>
				</Content>
			</Paper>
		</div>
	{:else}
		<div class="paper item">
			<Paper>
				<Title>Loading...</Title>
				<Content>
					<div style="display: flex; justify-content: center">
						<CircularProgress style="height: 32px; width: 32px;" indeterminate />
					</div>
				</Content>
			</Paper>
		</div>
	{/if}
</div>

<style>
	.menu-list {
		max-width: 300px;
	}
	.container {
		display: flex;
	}
	.item {
		flex-grow: 1;
		padding: 5px;
	}
</style>
