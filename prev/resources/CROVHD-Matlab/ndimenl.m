% ndimenl.m -
% Classifies the points and draws the plots
%*************************************************************************

function distribution = ndimenl(dimen,points,intervalLen,extra,flag,handles)%handles.plotFlag,baxes)
%--------------------Create n-dimensional points--------------------------
meanPt=mean(points);
[m n]=size(points);
npts=m;
for i=1:dimen
    points(:,i)=points(:,i)-meanPt(i);
end

%------------------Initialise structure for bins--------------------------
inter=(max(points)-min(points));
rmax=sqrt(sum(inter.*inter));
bins=ceil(rmax/intervalLen)-extra;

for i=1:bins
    for j=1:2^dimen , distribution{i,j}=[]; end
end

%------------------Classify the points------------------------------------
for i=1:npts
	%----------(a) According to the radius----------------------------
	rad=sqrt(sum(points(i,:).*points(i,:)));
	index=ceil(rad/intervalLen);
	if index==0 , index=1;  end
    %----------(b) According to the quadrants-------------------------	
	qnum=0;
	pt=points(i,:);
	for j=1:dimen
		if (pt(j)>=0) 
			qnum=2*qnum; 
		else  
			qnum=2*qnum+1;   
		end	
	end
	
    qnum=qnum+1;
	distribution{index,qnum}=[distribution{index,qnum};points(i,:)];
end

if n>6 
    str=['1 sec= 2^' num2str(n-6) 'quads'];
else
    str=['1 sec = 1 quad'];
end
distribution
handles.colorDist
% ------------------------To enable mouse tracking-------------------------
if flag==1
    figure;
    var11=1;
   
    mouseTracker(distribution,intervalLen,handles,var11);
end
hold on;

% ---------------------To draw scatter or density plot---------------------
if handles.plotFlag
    visualise(distribution,intervalLen,str,handles.colorDist);
else
    visualiseScatter(distribution,intervalLen,str,handles.baseAxes,handles.colorDist);
end
end
%*************************************************************************
