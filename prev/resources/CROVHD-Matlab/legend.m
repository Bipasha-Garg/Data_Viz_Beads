function varargout = legend(varargin)
% LEGEND M-file for legend.fig
%      LEGEND, by itself, creates a new LEGEND or raises the existing
%      singleton*.
%
%      H = LEGEND returns the handle to a new LEGEND or the handle to
%      the existing singleton*.
%
%      LEGEND('CALLBACK',hObject,eventData,handles,...) calls the local
%      function named CALLBACK in LEGEND.M with the given input arguments.
%
%      LEGEND('Property','Value',...) creates a new LEGEND or raises the
%      existing singleton*.  Starting from the left, property value pairs are
%      applied to the GUI before legend_OpeningFcn gets called.  An
%      unrecognized property name or invalid value makes property application
%      stop.  All inputs are passed to legend_OpeningFcn via varargin.
%
%      *See GUI Options on GUIDE's Tools menu.  Choose "GUI allows only one
%      instance to run (singleton)".
%
% See also: GUIDE, GUIDATA, GUIHANDLES

% Edit the above text to modify the response to help legend

% Last Modified by GUIDE v2.5 08-Jul-2011 22:29:36

% Begin initialization code - DO NOT EDIT
gui_Singleton = 1;
gui_State = struct('gui_Name',       mfilename, ...
                   'gui_Singleton',  gui_Singleton, ...
                   'gui_OpeningFcn', @legend_OpeningFcn, ...
                   'gui_OutputFcn',  @legend_OutputFcn, ...
                   'gui_LayoutFcn',  [] , ...
                   'gui_Callback',   []);
if nargin && ischar(varargin{1})
    gui_State.gui_Callback = str2func(varargin{1});
end

if nargout
    [varargout{1:nargout}] = gui_mainfcn(gui_State, varargin{:});
else
    gui_mainfcn(gui_State, varargin{:});
end
% End initialization code - DO NOT EDIT


% --- Executes just before legend is made visible.
function legend_OpeningFcn(hObject, eventdata, handles, varargin)
% This function has no output args, see OutputFcn.
% hObject    handle to figure
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)
% varargin   command line arguments to legend (see VARARGIN)

% Choose default command line output for legend
handles.output = hObject;
handles.colorDist=varargin{1};
handles.numColors=length(handles.colorDist);

plotColor(handles.colorDist);
uiwait(gcf);
% Update handles structure
guidata(hObject, handles);

% UIWAIT makes legend wait for user response (see UIRESUME)
% uiwait(handles.figure1);


% --- Outputs from this function are returned to the command line.
function varargout = legend_OutputFcn(hObject, eventdata, handles) 
% varargout  cell array for returning output args (see VARARGOUT);
% hObject    handle to figure
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)
handles.output=handles.colorDist;
% Get default command line output;from handles structure
varargout{1} = handles.output;
handles.output




% --- Executes on button press in change_pushbutton.
function change_pushbutton_Callback(hObject, eventdata, handles)
str={};
for i=1:handles.numColors
    str{i}=['color' num2str(i)];
end
[s,v] = listdlg('PromptString','Select a file:',...
                'SelectionMode','single',...
                'ListString',str);
            
prompt={'Lowest Mark:','Highest Mark:','R','G','B'};
name='Color Parameters';
numlines=1;
for i=1:5
    defaultanswer{i}=num2str(handles.colorDist(s,i));
end
answer=inputdlg(prompt,name,numlines,defaultanswer);
for i=1:5
    handles.colorDist(s,i)=str2double(answer(i));
end
guidata(hObject, handles);
plotColor(handles.colorDist);



% --- Executes on button press in add_pushbutton.
function add_pushbutton_Callback(hObject, eventdata, handles)
prompt={'Lowest Mark:','Highest Mark:','R','G','B'};
name='Color Parameters';
numlines=1;
for i=1:5
    defaultanswer{i}='0';
end
answer=inputdlg(prompt,name,numlines,defaultanswer)
for i=1:5
    handles.colorDist(handles.numColors+1,i)=str2double(answer(i))
end
handles.numColors=handles.numColors+1;
cla 
guidata(hObject, handles);
plotColor(handles.colorDist);

