import _ from 'lodash';
import {ContextMenu, Portal, FormElementAddon, Textbox} from 'flood-ui-kit';
import {FormattedMessage, injectIntl} from 'react-intl';
import React from 'react';

import CustomScrollbars from '../CustomScrollbars';
import EventTypes from '../../../constants/EventTypes';
import Search from '../../../components/icons/Search';
import UIStore from '../../../stores/UIStore';
import TorrentFilterStore from '../../../stores/TorrentFilterStore';

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

  closeTagsList = () => {
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
    
    if (!this.state.isTagsListOpen){
      this.setState({
        isTagsListOpen: true,
        isFetching: true
      });
    }

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

  handleTagClick = tag => {
    const currentTagsValue = this.state.textboxRef.value;
    const completedTags = currentTagsValue.slice(0, currentTagsValue.lastIndexOf(',') + 1);
    const newTags = `${completedTags} ${tag},`;
    console.log(newTags);

    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.textboxRef.value = newTags;
    this.setState({tags: newTags});
  };

  handleDocumentClick = () => {
    this.closeTagsList();
  };

  handleModalDismiss = () => {
    this.closeTagsList();
  };

  handleWindowResize = () => {
    this.closeTagsList();
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

  getTagsList(){
    let allTags = TorrentFilterStore.getTorrentTagCount();
    delete allTags.all;
    delete allTags.untagged;
    let currentTags = this.state.textboxRef ?
                        this.state.textboxRef.value ? this.state.textboxRef.value.split(',') 
                          : []
                        : [];

    let tags = Object.keys(allTags).filter((element) => {
      return (currentTags.indexOf(element) === -1)
    });

    const tagsList = tags.map((tag) => {
      return(
        <li
          className="filesystem__directory-list__item"
          key={tag}
          onClick={() => this.handleTagClick(tag)}
        >
            {tag}
        </li>
      );
    });
    return tagsList;
  }

  render() {
    let tagsList = this.getTagsList()
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
            <CustomScrollbars
              autoHeight={true}
              autoHeightMin={0}
              autoHeightMax={
                this.contextMenuInstanceRef
                && this.contextMenuInstanceRef.dropdownStyle
                && this.contextMenuInstanceRef.dropdownStyle.maxHeight
              }
            >
              <div className="filesystem__directory-list context-menu__items__padding-surrogate">
                {tagsList}
              </div>
            </CustomScrollbars>
            {/*<FilesystemBrowser
              directory={this.state.tags}
              intl={this.props.intl}
              maxHeight={
                this.contextMenuInstanceRef
                && this.contextMenuInstanceRef.dropdownStyle
                && this.contextMenuInstanceRef.dropdownStyle.maxHeight
              }
              onDirectorySelection={this.handleDirectorySelection}
            />*/}
          </ContextMenu>
        </Portal>
      </Textbox>
    );
  }
}

export default injectIntl(Tags, {withRef: true});
