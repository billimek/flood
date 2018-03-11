import _ from 'lodash';
import {ContextMenu, Portal, Textbox} from 'flood-ui-kit';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import EventTypes from '../../../constants/EventTypes';
import Search from '../../../components/icons/Search';
import UIStore from '../../../stores/UIStore';

class Tags extends React.Component{
  contextMenuInstanceRef = null;
  contextMenuNodeRef = null;

  constructor(props) {
    super(props);

    const tags = props.defaultValue
      || '';

    this.state = {
      tags,
      error: null,
      isFetching: false,
      isTagsListOpen: false
    };

    this.handleWindowResize = _.debounce(this.handleWindowResize, 100);
  }


  componentDidMount() {
    UIStore.listen(EventTypes.UI_MODAL_DISMISSED, this.handleModalDismiss);
  }

  componentWillUpdate(_nextProps, nextState) {
    if (!this.state.isTagsListOpen && nextState.isTagsListOpen) {
      this.addTagsOpenEventListeners();
    } else if (this.state.isTagsListOpen && !nextState.isTagsListOpen) {
      this.removeTagsOpenEventListeners()
    }
  }

  componentWillUnmount() {
    UIStore.unlisten(EventTypes.UI_MODAL_DISMISSED, this.handleModalDismiss);
    this.removeTagsOpenEventListeners()
  }

  addTagsOpenEventListeners() {
    global.document.addEventListener('click', this.handleDocumentClick);
    global.addEventListener('resize', this.handleWindowResize);
  }

  closeDirectoryList = () => {
    if (this.state.isTagsListOpen) {
      this.setState({isTagsListOpen: false});
    }
  };

  getValue() {
    return this.getTags();
  }

  getTags() {
    return this.state.tags;
  }

  handleTagsChange = (event) => {
    const tags = event.target.value;

    if (this.props.onChange) {
      this.props.onChange(tags);
    }

    this.setState({tags});
  };

  handleTagsListButtonClick = (event) => {
    const isOpening = !this.state.isTagsListOpen;

    this.setState({
      isTagsListOpen: isOpening,
      isFetching: isOpening
    });
  };

  handleTagSelection = tags => {
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.textboxRef.value = tags;
    this.setState({tags});
  };

  handleDocumentClick = () => {
    this.closeDirectoryList();
  };

  handleModalDismiss = () => {
    this.closeDirectoryList();
  };

  handleWindowResize = () => {
    this.closeDirectoryList();
  };

  removeTagsOpenEventListeners() {
    global.document.removeEventListener('click', this.handleDocumentClick);
    global.removeEventListener('resize', this.handleWindowResize);
  }

  setTextboxRef = (ref) => {
    if (this.state.textboxRef !== ref) {
      this.setState({textboxRef: ref});
    }
  };

  toggleOpenState = () => {
    this.setState({
      isTagsListOpen: !this.state.isTagsListOpen
    });
  };

  render() {
    return (
      <Textbox
        addonPlacement="after"
        defaultValue={this.state.tags}
        id={this.props.id}
        label={this.props.label}
        onChange={this.handleTagsChange}
        onClick={event => event.nativeEvent.stopImmediatePropagation()}
        placeholder={this.props.placeholder}
        setRef={this.setTextboxRef}
      >
        <FormElementAddon onClick={this.handleTagsListButtonClick}>
          <Search />
        </FormElementAddon>
        <Portal>
          <ContextMenu
            in={this.state.isTagsListOpen}
            onClick={event => event.nativeEvent.stopImmediatePropagation()}
            overlayProps={{isInteractive: false}}
            padding={false}
            ref={ref => this.contextMenuInstanceRef = ref}
            setRef={ref => this.contextMenuNodeRef = ref}
            scrolling={false}
            triggerRef={this.state.textboxRef}
          >
            <FilesystemBrowser
              directory={this.state.tags}
              intl={this.props.intl}
              maxHeight={
                this.contextMenuInstanceRef
                && this.contextMenuInstanceRef.dropdownStyle
                && this.contextMenuInstanceRef.dropdownStyle.maxHeight
              }
              onDirectorySelection={this.handleDirectorySelection}
            />
          </ContextMenu>
        </Portal>
      </Textbox>
    );
  }
}

export default injectIntl(Tags, {withRef: true});
